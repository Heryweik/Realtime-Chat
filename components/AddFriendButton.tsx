"use client";

import { addFriendValidator } from "@/lib/validations/add-friend";
import Button from "./ui/Button";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Se usa infer para obtener el tipo de los datos que se validan
type FormData = z.infer<typeof addFriendValidator>;

export default function AddFriendButton() {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Se usa useForm para manejar el estado del formulario
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  const addFriend = async (email: string) => {
    try {
      // Se usa el validador para parsear el email
      // parse lanza una excepción si el email no es válido
      const validatedEmail = addFriendValidator.parse({ email });

      await axios.post("/api/friends/add", {
        email: validatedEmail,
      });

      setShowSuccess(true);
    } catch (error) {
      // Se manejan los errores de validación y de la API
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message });
        return;
      }

      if (error instanceof AxiosError) {
        setError("email", { message: error.response?.data });
        return;
      }

      setError("email", { message: "Something went wrong" });
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm flex flex-col items-center justify-center"
    >
      <label
        htmlFor=""
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by E-Mail
      </label>

      <div className="mt-2 flex gap-4">
        <input
          // Se usa register para conectar el input con el hook form
          {...register("email")}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        <Button className="">Add</Button>
      </div>
      {errors.email && 
      <p className="mt-3 text-sm text-red-600 p-2 bg-red-100 rounded-md border border-red-600">{errors.email?.message}</p>
      }
      {showSuccess && (
        <p className="mt-3 text-sm text-green-600 p-2 bg-green-100 rounded-md border border-green-600">Friend request sent!</p>
      )}
    </form>
  );
}
