import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to orders page as the default landing
  redirect('/orders');
}