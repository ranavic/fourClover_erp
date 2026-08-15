import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} — fourClover ERP`;
    return () => { document.title = 'fourClover ERP'; };
  }, [title]);
};
