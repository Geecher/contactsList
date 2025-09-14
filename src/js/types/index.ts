export interface Contact {
    id?: string;
    name: string;
    vacancy: string;
    phone: string;
}

export type Modal = 'edit-modal' | 'search-modal';

export type Field = 'name' | 'vacancy' | 'phone';

export type Message = 'success' | 'error';