export interface RegisterUserDto {
    name: string;
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
}

export interface RegisterResponse extends AuthUser {
    createdAt: string;
}

export interface LoginResponse extends AuthUser { }

export interface BackendErrorResponse {
    statusCode?: number;
    message?: string | string[];
    error?: string;
}