"use client";
import Content from "../components/Content";
import React from "react";
import { Suspense } from 'react';


const ContentPage = () => {
  return <Suspense>
    <Content />
  </Suspense>;
};

export default ContentPage;
