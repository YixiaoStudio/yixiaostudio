import os
import bcrypt
import pymysql
import random  # 新增：导入random模块生成6位数字验证码
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, redirect
from dotenv import load_dotenv
# 新增：导入CORS解决跨域问题
from flask_cors import CORS
# 新增：导入邮件发送相关模块
from flask_mail import Mail, Message

# 加载环境变量（建议将敏感信息放在.env文件，不要硬编码）
load_dotenv()

app = Flask(__name__)
# 开启调试模式（开发环境），方便看详细报错
app.config['DEBUG'] = True

# -------------------------- 新增：邮箱SMTP配置（核心） --------------------------
# 配置说明：优先从.env文件读取，也可直接修改（推荐用QQ邮箱，新手易配置）
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.qq.com')  # QQ邮箱SMTP服务器
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))          # SMTP端口
app.config['MAIL_USE_TLS'] = True                                   # 启用TLS加密
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')            # 发件人邮箱（你的QQ邮箱）
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')            # 邮箱SMTP授权码（不是登录密码）
app.config['MAIL_DEFAULT_SENDER'] = ('逸潇AI助手', app.config['MAIL_USERNAME'])  # 发件人名称

# 初始化邮件服务
mail = Mail(app)

# 新增：完整的CORS跨域配置（解决React前端请求被阻止的核心）
CORS(
    app,
    supports_credentials=True,  # 允许跨域携带Cookie/凭证
    origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # 明确允许React前端的地址
    methods=["GET", "POST", "OPTIONS"],  # 允许前端的请求方法（包含预检请求OPTIONS）
    allow_headers=["Content-Type", "Authorization"]  # 允许前端的请求头
)

# 阿里云RDS数据库连接配置（从.env文件读取）
DB_CONFIG = {
    'host': os.getenv('RDS_HOST'),      # RDS实例的外网地址（本地开发用这个）
    'port': int(os.getenv('RDS_PORT', 3306)),
    'user': os.getenv('RDS_USER'),      # 专用应用账号
    'password': os.getenv('RDS_PASSWORD'),
    'database': os.getenv('RDS_DB_NAME'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor  # 返回字典格式的结果
}

# -------------------------- 工具函数 --------------------------
def get_db_connection():
    """获取数据库连接（每次请求创建新连接，避免连接池问题）"""
    try:
        conn = pymysql.connect(**DB_CONFIG)
        return conn
    except pymysql.MySQLError as e:
        error_msg = f"数据库连接失败: {str(e)}"
        app.logger.error(error_msg)
        # 抛出具体错误，让接口层捕获
        raise Exception(error_msg)

def generate_salt_and_hash(password):
    """生成盐值和密码哈希（不可逆）"""
    salt = bcrypt.gensalt()  # 生成随机盐值
    password_hash = bcrypt.hashpw(password.encode('utf8'), salt)
    return salt.decode('utf8'), password_hash.decode('utf8')

def verify_password(input_password, stored_salt, stored_hash):
    """验证密码是否正确"""
    input_hash = bcrypt.hashpw(
        input_password.encode('utf8'),
        stored_salt.encode('utf8')
    )
    return input_hash.decode('utf8') == stored_hash

# 修改：生成6位数字邮箱验证码（替换原UUID格式）
def generate_verification_code():
    """生成6位随机数字验证码（100000-999999）"""
    return str(random.randint(100000, 999999))

# 新增：发送邮箱验证邮件
def send_verification_email(to_email, username, verify_code):
    """
    发送验证邮件
    :param to_email: 收件人邮箱
    :param username: 用户名
    :param verify_code: 6位数字验证码
    """
    # 验证链接（前端域名，开发环境用localhost:3000）
    verify_url = f"http://localhost:3000/verify-email?code={verify_code}"
    
    # 邮件内容（HTML格式，适配各类邮箱，修改验证码提示为6位数字）
    msg = Message(
        subject=f"【逸潇AI助手】邮箱验证通知",
        recipients=[to_email],
        html=f"""
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">您好，{username}！</h2>
                <p style="color: #666; line-height: 1.6;">感谢您注册逸潇AI助手，请点击下方链接完成邮箱验证（15分钟内有效）：</p>
                <a href="{verify_url}" style="display: inline-block; padding: 12px 24px; background: #4096ff; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">
                    点击验证邮箱
                </a>
                <p style="color: #666; line-height: 1.6;">如果链接无法点击，请手动输入<strong style="color: #4096ff; font-size: 18px;">6位数字验证码</strong>：<strong style="color: #4096ff; font-size: 20px;">{verify_code}</strong></p>
                <p style="color: #999; font-size: 12px;">若不是您本人操作，请忽略此邮件。</p>
            </div>
        """
    )
    # 发送邮件
    mail.send(msg)

# -------------------------- 接口实现 --------------------------
@app.route('/api/register', methods=['POST'])
def register():
    """用户注册接口（新增邮箱验证逻辑）"""
    # 第一步：容错处理JSON解析
    try:
        data = request.get_json()
        if data is None:
            return jsonify({
                'code': 415,
                'msg': '请设置请求头 Content-Type: application/json，且请求体为合法JSON'
            }), 415
    except Exception as e:
        return jsonify({
            'code': 400,
            'msg': f'JSON格式错误：{str(e)}'
        }), 400

    # 1. 校验入参
    required_fields = ['username', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'code': 400, 'msg': '缺少必要参数（需要username、email、password）'}), 400
    
    username = data['username']
    email = data['email']
    password = data['password']

    # 2. 检查用户名/邮箱是否已存在 & 插入数据
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 检查用户名
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({'code': 409, 'msg': '用户名已存在'}), 409
            
            # 检查邮箱
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({'code': 409, 'msg': '邮箱已存在'}), 409
            
            # 3. 生成盐值和密码哈希
            salt, password_hash = generate_salt_and_hash(password)
            
            # 新增：生成6位数字邮箱验证码+过期时间（15分钟）
            verify_code = generate_verification_code()
            code_expire_time = datetime.now() + timedelta(minutes=15)
            
            # 4. 插入用户数据（新增验证相关字段）
            sql = """
                INSERT INTO users (username, email, password_hash, salt, 
                                 verification_code, code_expire_time, email_verified)
                VALUES (%s, %s, %s, %s, %s, %s, 0)
            """
            cursor.execute(sql, (username, email, password_hash, salt, verify_code, code_expire_time))
            conn.commit()
            
            # 新增：发送验证邮件（异步发送，避免用户等待）
            try:
                send_verification_email(email, username, verify_code)
            except Exception as e:
                app.logger.error(f"发送验证邮件失败：{str(e)}")
                # 邮件发送失败不影响注册，仅提示
                return jsonify({
                    'code': 200,
                    'msg': '注册成功，但验证邮件发送失败，请联系客服',
                    'data': {'user_id': cursor.lastrowid, 'email_verified': 0}
                }), 200
            
            # 注册成功+邮件发送成功
            return jsonify({
                'code': 200,
                'msg': '注册成功！请查收邮箱完成6位数字验证码验证（15分钟内有效）',
                'data': {'user_id': cursor.lastrowid, 'email_verified': 0}
            }), 200
    
    # 捕获数据库相关错误（返回具体原因）
    except pymysql.MySQLError as e:
        if conn:
            conn.rollback()
        error_msg = f"数据库操作失败：{str(e)}"
        app.logger.error(f"注册失败: {error_msg}")
        return jsonify({'code': 500, 'msg': error_msg}), 500
    
    # 捕获所有其他错误（比如连接失败）
    except Exception as e:
        error_msg = f"服务器错误：{str(e)}"
        app.logger.error(f"注册失败: {error_msg}")
        return jsonify({'code': 500, 'msg': error_msg}), 500
    
    finally:
        if conn:
            conn.close()

# 新增：邮箱验证接口（前端输入6位数字验证码验证）
@app.route('/api/verify-email', methods=['POST'])
def verify_email():
    """邮箱验证接口（支持前端输入6位数字验证码）"""
    try:
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({'code': 400, 'msg': '缺少验证码参数'}), 400
        
        verify_code = data['code'].strip()
        # 新增：校验验证码格式（6位数字）
        if len(verify_code) != 6 or not verify_code.isdigit():
            return jsonify({'code': 400, 'msg': '请输入有效的6位数字验证码'}), 400
            
    except Exception as e:
        return jsonify({'code': 400, 'msg': f'参数解析错误：{str(e)}'}), 400

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 1. 查询验证码是否有效（未验证+未过期）
            sql = """
                SELECT id, code_expire_time 
                FROM users 
                WHERE verification_code = %s AND email_verified = 0
            """
            cursor.execute(sql, (verify_code,))
            user = cursor.fetchone()

            # 2. 校验验证码
            if not user:
                return jsonify({'code': 400, 'msg': '无效的6位数字验证码'}), 400
            
            # 3. 校验验证码是否过期
            if datetime.now() > user['code_expire_time']:
                return jsonify({'code': 400, 'msg': '验证码已过期，请重新注册或发送验证邮件'}), 400
            
            # 4. 更新验证状态（标记为已验证，清空验证码）
            update_sql = """
                UPDATE users 
                SET email_verified = 1, verification_code = NULL, code_expire_time = NULL
                WHERE id = %s
            """
            cursor.execute(update_sql, (user['id'],))
            conn.commit()

            return jsonify({'code': 200, 'msg': '邮箱验证成功！现在可以登录了'}), 200
    
    except pymysql.MySQLError as e:
        if conn:
            conn.rollback()
        error_msg = f"数据库操作失败：{str(e)}"
        app.logger.error(f"邮箱验证失败: {error_msg}")
        return jsonify({'code': 500, 'msg': error_msg}), 500
    except Exception as e:
        error_msg = f"服务器错误：{str(e)}"
        app.logger.error(f"邮箱验证失败: {error_msg}")
        return jsonify({'code': 500, 'msg': error_msg}), 500
    finally:
        if conn:
            conn.close()

# 新增：邮箱验证接口（邮件链接跳转验证）
@app.route('/api/verify-email-link', methods=['GET'])
def verify_email_by_link():
    """通过邮件链接验证（跳转前端页面）"""
    verify_code = request.args.get('code')
    if not verify_code:
        return redirect('http://localhost:3000/verify-failed?msg=缺少验证码')
    
    # 新增：校验链接中的验证码格式
    if len(verify_code) != 6 or not verify_code.isdigit():
        return redirect('http://localhost:3000/verify-failed?msg=验证码格式错误（需6位数字）')
    
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 查询验证码有效性
            sql = """
                SELECT id, code_expire_time 
                FROM users 
                WHERE verification_code = %s AND email_verified = 0
            """
            cursor.execute(sql, (verify_code,))
            user = cursor.fetchone()

            # 校验验证码/过期时间
            if not user or datetime.now() > user['code_expire_time']:
                return redirect('http://localhost:3000/verify-failed?msg=验证码无效或已过期')
            
            # 更新验证状态
            update_sql = """
                UPDATE users 
                SET email_verified = 1, verification_code = NULL, code_expire_time = NULL
                WHERE id = %s
            """
            cursor.execute(update_sql, (user['id'],))
            conn.commit()

            # 跳转前端验证成功页面
            return redirect('http://localhost:3000/verify-success')
    except Exception as e:
        app.logger.error(f"链接验证失败：{str(e)}")
        return redirect('http://localhost:3000/verify-failed?msg=服务器错误')
    finally:
        if conn:
            conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    """用户登录接口（新增邮箱验证状态检查）"""
    # 第一步：容错处理JSON解析
    try:
        data = request.get_json()
        if data is None:
            return jsonify({
                'code': 415,
                'msg': '请设置请求头 Content-Type: application/json，且请求体为合法JSON'
            }), 415
    except Exception as e:
        return jsonify({
            'code': 400,
            'msg': f'JSON格式错误：{str(e)}'
        }), 400

    # 1. 校验入参
    if not ('account' in data and 'password' in data):
        return jsonify({'code': 400, 'msg': '缺少账号或密码（需要account、password）'}), 400
    
    account = data['account']  # 支持用户名/邮箱
    password = data['password']

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 2. 查询用户信息（新增email_verified字段）
            sql = """
                SELECT id, username, email, password_hash, salt, status, email_verified 
                FROM users 
                WHERE username = %s OR email = %s
            """
            cursor.execute(sql, (account, account))
            user = cursor.fetchone()
            
            # 3. 校验用户是否存在、状态是否正常
            if not user:
                return jsonify({'code': 401, 'msg': '账号不存在'}), 401
            if user['status'] != 1:
                return jsonify({'code': 403, 'msg': '账号已禁用或锁定'}), 403
            
            # 4. 校验密码
            if not verify_password(password, user['salt'], user['password_hash']):
                return jsonify({'code': 401, 'msg': '密码错误'}), 401
            
            # 新增：校验邮箱是否验证
            if user['email_verified'] == 0:
                return jsonify({
                    'code': 403,
                    'msg': '您的邮箱尚未验证，请先查收邮件完成6位数字验证码验证',
                    'data': {'email': user['email']}
                }), 403
            
            # 5. 更新最后登录时间
            update_sql = "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = %s"
            cursor.execute(update_sql, (user['id'],))
            conn.commit()
            
            # 6. 返回登录成功信息
            return jsonify({
                'code': 200,
                'msg': '登录成功',
                'data': {
                    'user_id': user['id'],
                    'username': user['username'],
                    'email': user['email']
                }
            }), 200
    
    # 捕获数据库相关错误（返回具体原因）
    except pymysql.MySQLError as e:
        if conn:
            conn.rollback()
        error_msg = f"数据库操作失败：{str(e)}"
        app.logger.error(f"登录失败: {error_msg}")
        return jsonify({'code': 500, 'msg': error_msg}), 500
    
    # 捕获所有其他错误
    except Exception as e:
        error_msg = f"服务器错误：{str(e)}"
        app.logger.error(f"登录失败: {error_msg}")
        return jsonify({'code': 500, 'msg': error_msg}), 500
    
    finally:
        if conn:
            conn.close()

# 新增：测试接口，验证服务是否正常
@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口，无需数据库连接"""
    return jsonify({'code': 200, 'msg': '服务运行正常'}), 200

if __name__ == '__main__':
    # 开发环境运行，开启调试模式（能看到详细报错）
    app.run(debug=True, host='0.0.0.0', port=5000)