import React from "react";
import useSWR from "swr";

const fetcher = async (url: string) => {
  return await fetch(url, {
    method: 'POST',
    body: ''

  })
    .then((res) => res.json())
};

export default function Profile() {
  const { data, error, isLoading } = useSWR('/api/push', fetcher)

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  return <div>hello {JSON.stringify(data)}!</div>
}
