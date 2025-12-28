export interface AuthState {
    user: {
        uid: string
        displayName: string | null
        email: string | null
        photoURL: string | null
    } | null;
    erro: string | null;
    loading: boolean;
}