import type { NextPage } from 'next';

const Page: NextPage = () => {
  return null;
};

export default Page;

export const getServerSideProps = async() => {
  return {
    redirect: {
      destination: 'https://www.sidrachain.com/tokens',
      permanent: true,
    },
  };
};
