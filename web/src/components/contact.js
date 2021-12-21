import React from 'react';
import { useForm } from 'react-hook-form';

export default function Contact() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  // const onSubmit = data => console.log(data);
  console.log(errors);

  // remove async here: 

  const onSubmit = data => {

    console.log(data);

    fetch('/api/contact/index.php', {
          method: 'POST',
          body: JSON.stringify(data),
          type: 'application/json'
        })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })  

    // try {
    //   await fetch('/api/contact/index.php', {
    //     method: 'POST',
    //     body: JSON.stringify(data),
    //     type: 'application/json'
    //   })  
    //   // setIsSubmitting(false)
    //   // setHasSubmitted(true)
    // } catch (err) {
    //   // setFormData(err)
    //   console.log(err);
    // }
  }




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
