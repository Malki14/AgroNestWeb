import { useContext } from 'react';
import AppContext from './AppContextInternal';

export function useApp() {
  return useContext(AppContext);
}
