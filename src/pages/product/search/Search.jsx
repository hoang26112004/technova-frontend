/* eslint-disable */
import Layout from '@/components/commons/layout/Layout';
import TitleRouter from '@/components/product/titleRouter/TitleRouter';
import SearchContainer from '@/components/search/searchContainer/SearchContainer';
import React from 'react';

const Search = () => {
  return (
    <div>
      <Layout>
        <TitleRouter title="Tìm kiếm" />
        <SearchContainer />
      </Layout>
    </div>
  );
}

export default Search;

