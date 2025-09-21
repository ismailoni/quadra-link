import Image from "next/image";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Quadra Link</h1>
      <p>Your social platform for school connections.</p>
      <Image
        src="/images/school-network.png"
        alt="School Network"
        width={600}
        height={400}
      />
    </main>
  );
}
