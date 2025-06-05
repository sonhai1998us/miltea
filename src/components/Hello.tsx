// components/UserFetcher.js
import { useEffect, useState } from 'react';

type User = {
    name: string
  };
   

export default function UserFetcher() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  if (!user) return <div>Loading...</div>;
  return <div>User: {user.name}</div>;
}
