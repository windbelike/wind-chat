import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react';

export default function Index() {
  // @ts-ignore
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const [countries, setCountries] = useState<any[] | null>([]);

  useEffect(() => {
    getCountries();
  }, []);

  async function getCountries() {
    const { data } = await supabase.from("countries").select();
    setCountries(data);
  }

  if (countries == null) {
    return <h1> error </h1>
  }

  return (
    <ul>
      {countries.map((country) => (
        <li key={country.name}>{country.name}</li>
      ))}
    </ul>
  );
}
