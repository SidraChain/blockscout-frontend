import type { GetServerSideProps, NextPage } from 'next';

const Page: NextPage = () => null;

export default Page;

export const getServerSideProps: GetServerSideProps = async() => {
  return {
    redirect: {
      destination: 'https://www.sidrachain.com/tokens',
      permanent: false,
    },
  };
};
