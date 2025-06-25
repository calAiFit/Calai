"use client";

import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <SignIn />
      </div>
    </div>
  );
};

export default SignInPage;
