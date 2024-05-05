import Button from "@/components/ui/Button";
import { db } from "@/lib/db";


export default async function Home() {

  // Prueba de funcionamiento de la base de datos, estose ve en 'Data Browser' en Upstash
  /* await db.set("Hello", "World"); */


  return (
    <Button >Click me</Button>
  );
}
