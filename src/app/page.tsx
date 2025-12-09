// "use client";
// import { useTRPC } from "@/trpc/client";
import { caller } from "@/trpc/server";
import { useQuery } from "@tanstack/react-query";

export default async function Home() {

  //FOR CLIENT SIDE
  // const trpc = useTRPC();
  // const { data } = useQuery(trpc.hello.queryOptions({ text: "Shubham!" }));
  // const greeting = JSON.stringify(data?.greeting);

  //FOR SERVER SIDE
  const data = await caller.hello({ text: "Shubham!" });
  const greeting = JSON.stringify(data?.greeting);

  return (
    <div>
      <h1>{greeting}</h1>
    </div>
  );
}
