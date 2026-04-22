export const WA_NUMBER = '201035634036';
export const WA_PHONE_DISPLAY = '+20 103 563 4036';

export const waLink = (message: string) =>
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
