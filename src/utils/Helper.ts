"use strict";

/* Application */
const apiUrl = process.env.API_URL;
import { Buffer } from 'buffer';
import axios, { AxiosResponse } from 'axios';

interface ApiResponse<T> {
  status?: string;
  total?: number;
  data?: T;
  error?: Error;
}

interface ApiOptions {
  headers?: {
    Authorization?: string;
  };
  data?: unknown;
}

interface CookieObject {
  [key: string]: string;
}

export const fetchApi = async <T>(url: string, token: string = ''): Promise<ApiResponse<T>> => {
  let _url: string;
  const _options: ApiOptions = {};
  
  if (url?.indexOf("http") !== -1) {
    _url = url;
  } else {
    _url = apiUrl + url;
  }
  
  if (token) {
    _options.headers = { "Authorization": `Bearer ${token}` };
  }
  
  try {
    const response: AxiosResponse<ApiResponse<T>> = await axios.get(_url, _options);
    return response.data;
  } catch (error) {
    return { error: error as Error };
  }
};

export const postApi = async <T>(url: string, params: object, token: string = ''): Promise<ApiResponse<T>> => {
  let _url: string;
  const _options: ApiOptions = {};
  
  if (url.indexOf("http") !== -1) {
    _url = url;
  } else {
    _url = apiUrl + url;
  }
  
  if (token) {
    _options.headers = { "Authorization": `Bearer ${token}` };
  }
  
  try {
    const response: AxiosResponse<ApiResponse<T>> = await axios.post(_url, params, _options);
    return response.data;
  } catch (error) {
    return { error: error as Error };
  }
};

export const fetchApiWithoutChildData = async(url: string, token: string = '') => {
  let _url: string;
  const _options: ApiOptions = {};
  
  if (url?.indexOf("http") !== -1) {
    _url = url;
  } else {
    _url = apiUrl + url;
  }
  
  if (token) {
    _options.headers = { "Authorization": `Bearer ${token}` };
  }
  
  try {
    const response = await axios.get(_url, _options).then(resp=>resp?.data??resp).catch(e=>e);
    return response;
  } catch (error) {
    return { error: error as Error };
  }
};

export const postApiWithoutChildData = async(url: string, params: object, token: string = '') => {
  let _url: string;
  const _options: ApiOptions = {};
  
  if (url.indexOf("http") !== -1) {
    _url = url;
  } else {
    _url = apiUrl + url;
  }
  
  if (token) {
    _options.headers = { "Authorization": `Bearer ${token}` };
  }
  
  try {
    const response = await axios.post(_url, params, _options).then(resp=> resp?.data ?? resp).catch(e=>e);
    return response;
  } catch (error) {
    return { error: error as Error };
  }
};

export const putApi = async <T>(url: string, params: object, token: string = '', _options: ApiOptions = {}): Promise<ApiResponse<T>> => {
  let _url: string;
  
  if (url.indexOf("http") !== -1) {
    _url = url;
  } else {
    _url = apiUrl + url;
  }
  
  if (token) {
    _options.headers = { "Authorization": `Bearer ${token}` };
  }
  
  try {
    const response: AxiosResponse<ApiResponse<T>> = await axios.put(_url, params, _options);
    return response.data;
  } catch (error) {
    return { error: error as Error };
  }
};

export const deleteApi = async <T>(url: string, token: string = '', params: string = ''): Promise<ApiResponse<T>> => {
  let _url: string;
  const _options: ApiOptions = {};
  
  if (url.indexOf("http") !== -1) {
    _url = url;
  } else {
    _url = apiUrl + url;
  }
  
  if (token) {
    _options.headers = { "Authorization": `Bearer ${token}` };
  }
  
  if (params) {
    _options.data = { ids: params };
  }
  
  try {
    const response: AxiosResponse<ApiResponse<T>> = await axios.delete(_url, _options);
    return response.data;
  } catch (error) {
    return { error: error as Error };
  }
};

export const putMultipleApi = async <T>(
  url: string,
  params: { [key: string]: string[] },
  token: string = ''
): Promise<ApiResponse<T>> => {
  let _url: string;
  const _options: ApiOptions = {};

  if (url.indexOf("http") !== -1) {
    _url = url;
  } else {
    _url = apiUrl + url;
  }

  if (token) {
    _options.headers = { "Authorization": `Bearer ${token}` };
  }

  // Attach the params as the data payload for the DELETE request
  _options.data = params;

  try {
    const response: AxiosResponse<ApiResponse<T>> = await axios.put(_url, params);
    return response.data;
  } catch (error) {
    return { error: error as Error };
  }
};

export const extractValuesByKey =<T, K extends keyof T>(array: T[], key: K): T[K][] => {
  return array.map(item => item[key]);
}

export const parseCookie = (str: string): CookieObject => {
  if (str) {
    return str.split(';').map(v => v.split('=')).reduce((cookie: CookieObject, v: string[]) => {
      cookie[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return cookie;
    }, {});
  } else {
    return {};
  }
};

export const base64Encode = (str: string): string => {
  return Buffer.from(str).toString('base64');
};

export const base64Decode = (str: string): string => {
  return Buffer.from(str, 'base64').toString();
};

export const dateFormat = (str: string): string => {
  const _date = new Date(str);
  return `${_date.getDate()}/${_date.getMonth() + 1}/${_date.getFullYear()}`;
};

export const changeToSlug = (str: string): string => {
  const _str = str.trim().toLowerCase();

  return _str
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    .replace(/đ/gi, 'd')
    .replace(/&/g, '-va-')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const capitalize = (str: string): string => {
  if (typeof str === 'string' && str !== '') {
    return str.charAt(0).toUpperCase() + str.slice(1);
  } else {
    return '';
  }
};

export const capitalizeFirstLetter = (string: string): string => {
  if (typeof string === 'string' && string !== '') {
    return string.charAt(0).toUpperCase();
  } else {
    return '';
  }
};

export const formatView = (num: number): string | number => {
  if (num > 999 && num < 1000000) {
    return (num/1000).toFixed(1) + 'K';
  } else if (num > 1000000) {
    return (num/1000000).toFixed(1) + 'M';
  } else if (num > 1000000000) {
    return (num/1000000).toFixed(1) + 'B';
  } else if (num < 900) {
    return num;
  }
  return num;
};

export const formatNum = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const convertImages = (htmlText: string): string => {
  return htmlText.replace(/<div style="text-align:none;"><img/g, '<div style="text-align:center;"><img');
}; 