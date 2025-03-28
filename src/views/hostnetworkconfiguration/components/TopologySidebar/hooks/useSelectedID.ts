import useQueryParams from '@utils/hooks/useQueryParams';

import { SELECTED_ID_QUERY_PARAM } from '../constants';

const useSelectedID = () => {
  const params = useQueryParams();

  return params?.[SELECTED_ID_QUERY_PARAM] || '';
};

export default useSelectedID;
