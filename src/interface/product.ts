export interface Option {
  name: string;
  price: number;
  default: boolean;
}

export interface Choose {
  title: string;
  multiple: boolean;
  options: Option[];
}
export interface ProductSetting {
  index: number;
  id: string;
  name: string;
  img: string;
  price: number;
  htmlStr: string;
  choose: Choose[];
  isPublished: boolean;
}

export interface Product {
  index: number;
  name: string;
  imgName: string;
  price: number;
  htmlStr: string;
  choose: Choose[];
  isPublished: boolean;
}