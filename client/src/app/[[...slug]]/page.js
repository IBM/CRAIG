import { ClientOnly } from './client'

export function generateStaticParams() {
//   const router = useRouter();
//   const { id } = router.query;
//   console.log(id);
  const paths = [
    { slug: [''] },
    { slug: ['projects']},
    { slug: ['resetState']},
    { slug: ['v2', ':v2Page'] },
    { slug: ['docs', ':doc'] },
    { slug: ['docs', 'tutorial']},
    { slug: ['summary']},
    { slug: ['v2']},
    { slug: ['stats']},
    { slug: ['v2', 'stats']},
    { slug: ['form', 'secretsManager']}
    // Add more paths as needed
  ];
  return paths;
}
 
export default function Page({ params }) {
  return <ClientOnly />
}