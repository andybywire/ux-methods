import React from 'react';
import { useForm } from 'react-hook-form';

export default function Contact() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);
  console.log(errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
    <input type="text" placeholder="Name" {...register("Name", {required: true})} />
    <input type="text" placeholder="Email" {...register("Email", {required: true, pattern: /^\S+@\S+$/i})} />
    <input type="text" placeholder="Subject" {...register("Subject", {})} />
    <textarea {...register("Message", {required: true})} />

    <input type="submit" />
    </form>
  )
}
