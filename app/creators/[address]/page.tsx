import MemoryList from "@/components/MemoryList/memory-list"

export default async function Creators({ params }: {
  params: Promise<{ address: string }>
}) {
  const { address } = await params;
  return (
    <MemoryList address={address} title={`${address}'s Memory`} />
  )
}
