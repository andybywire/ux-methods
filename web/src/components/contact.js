import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as s from './contact.module.scss';
import { FiAlertTriangle } from 'react-icons/fi';

export default function Contact() {

  // Sets up basic data state
  const [formData, setFormData] = useState() 
        
  // Sets up our form states 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Prepares the functions from react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    mode: "onBlur" // "onChange"
  });
  // const onSubmit = data => console.log(data);
  console.log(errors);

  // removed async here; bring back once this is more or less working.
  // I should at least know _how_ to do this (i.e. to better choose to or not)
  // https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await

  const onSubmit = data => {

    setIsSubmitting(true)
        
    setFormData(data)


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
      .then(setIsSubmitting(false))
      .then(setHasSubmitted(true))

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

  if (isSubmitting) {
    // Returns a "Submitting comment" state if being processed
    return <h3>Submitting comment…</h3>
  }
  if (hasSubmitted) {
    // Returns the data that the user submitted for them to preview after submission
    return (
      <>
        <h3>Thanks for your comment!</h3>
        <ul>
          <li>test
            {/* Name: {formData.name} <br />
            Email: {formData.email} <br />
            Comment: {formData.comment} */}
          </li>
        </ul>
      </>
    )
  }

  return (
    <section className={s.contact}>
      <h1>Contact</h1>
      <p>Please feel free to get in touch with feedback, questions, suggestions for improvement&mdash;or just to say hi.</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label for="name" className={s.name}>
          <span>Name</span>
          <input type="text" id="name" {...register("name", {required: true})} />
          {errors?.name?.type === "required" && <p><FiAlertTriangle />This field is required</p>}
        </label>
        <label for="email" className={s.email}>
          <span>Email</span>
          <input type="text" id="email" {...register("email", {required: true, pattern: /^\S+@\S+$/i})} />
          {(errors?.email?.type === "required" || errors?.email?.type === "pattern") && <p><FiAlertTriangle />Please enter a valid email address. Don't worry&mdash;I won't use your email for anything else. </p>}
        </label>
        <label for="subject" className={s.subject}>
          <span>Subject</span>
          <input type="text" id="subject" {...register("subject", {})} />
        </label>
        <label for="message" className={s.message}>
          <span>Message</span>
          <textarea id="message" {...register("message", {required: true})} />
          {errors?.message?.type === "required" && <p><FiAlertTriangle />My mind reading is pretty good, though it's usually better if you tell me why you're writing.</p>}
        </label>
        <input type="submit" />
      </form>
    </section>
  )
}
