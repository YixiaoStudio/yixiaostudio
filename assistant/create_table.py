import os
import pymysql
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# RDS配置（和你的Flask项目用同一个.env）
DB_CONFIG = {
    'host': os.getenv('RDS_HOST'),
    'port': int(os.getenv('RDS_PORT', 3306)),
    'user': os.getenv('RDS_USER'),
    'password': os.getenv('RDS_PASSWORD'),
    'database': os.getenv('RDS_DB_NAME'),
    'charset': 'utf8mb4'
}

# 建表SQL
CREATE_USERS_TABLE_SQL = """
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户唯一ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（唯一）',
  `email` VARCHAR(100) NOT NULL COMMENT '用户邮箱（唯一，用于登录/找回密码）',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希值（不存储明文）',
  `salt` VARCHAR(32) NOT NULL COMMENT '密码盐值（增强哈希安全性）',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号（可选）',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '账号状态：1-正常，0-禁用，2-锁定',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
"""

try:
    # 连接数据库
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # 执行建表SQL
    cursor.execute(CREATE_USERS_TABLE_SQL)
    conn.commit()
    print("✅ users表创建成功！")
    
    # 验证表是否存在
    cursor.execute("SHOW TABLES LIKE 'users'")
    if cursor.fetchone():
        print("✅ 验证成功：users表已存在于数据库中")
    
    cursor.close()
    conn.close()
except pymysql.MySQLError as e:
    print(f"❌ 数据库错误：{e}")
except Exception as e:
    print(f"❌ 其他错误：{e}")