export const auth = {
  get token() { return localStorage.getItem('token'); },
  set token(t) { t ? localStorage.setItem('token', t) : localStorage.removeItem('token'); },
  isAuthed() { return !!localStorage.getItem('token'); }
};
