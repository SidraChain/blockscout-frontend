import type { NextPage } from 'next';
import { redirect } from 'next/navigation';

const Page: NextPage = () => {
  redirect('https://www.sidrachain.com/tokens');
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps';
