
export enum ProductStatus {
  AVAILABLE = '即将上线',
  PLANNING = '预计26年中旬上线',
  LONG_TERM = '预计27年上线'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  isPrimary?: boolean;
  tags: string[];
}
