import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from "next/navigation";
import { setAccessToken, refresh } from '@/store/authSlice';
import { base64Decode, fetchApiWithoutChildData, postApiWithoutChildData, putApi, base64Encode } from '@/utils/Helper';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires: number;
}

interface CookieData {
  expires: number;
  sg: string;
}

let renewTimeout: NodeJS.Timeout | null = null;

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dispatch = useDispatch();
    const router = useRouter();

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                throw new Error('Login failed');
            }

            const data: LoginResponse = await res.json();
            dispatch(setAccessToken(data.access_token));
            return data;
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async (sg: string, renew = false) => {
        const userInfo = sg;
        if (!userInfo) return;

        try {
            console.log('Refresh Token...', 'Start', new Date().toISOString());
            const _parse = base64Decode(userInfo).split(',');
            
            if (_parse.length !== 2) {
                throw new Error('Invalid token format');
            }

            const [email, refreshTokenValue] = _parse;
            const _info = await postApiWithoutChildData(process.env.PREFIX_API + 'token', { email, refreshToken: refreshTokenValue });
            
            if (_info?.status !== 'success') {
                console.log('_info2', _info);
                // throw new Error('Token refresh failed');
            }

            if (!renew) {
                const _account = await fetchApiWithoutChildData(process.env.PREFIX_API + 'me', _info.access_token);
                if (_account?.status === 'success') {
                    _account.result.accessToken = _info.access_token;
                    _account.result.refresh_token = _info.refresh_token;
                    dispatch(refresh(_account));
                }
            } else {
                dispatch(setAccessToken(_info.access_token));
            }
            
            const _sg = base64Encode(_parse[0] + ',' + _info.refresh_token);
            const _cookie: CookieData = {
                expires: _info.expires,
                sg: _sg
            };
            await putApi(process.env.DOMAIN_URL + '/api/cookie', _cookie);
            
            if(renewTimeout != null) clearTimeout(renewTimeout);
            renewTimeout = setTimeout(() => refreshToken(_sg, true), 25 * 60 * 1000);
            console.log('Refresh Token...', 'End', renewTimeout);
            
        } catch (error) {
            console.error('Token refresh error:', error);
            await fetch('/api/cookie', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            router.push("/signin");
        }
    };

    return { login, loading, error, refreshToken };
}
