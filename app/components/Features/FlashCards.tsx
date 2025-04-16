"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Flashcard {
  id: number
  question: string
}

export const Flashcards: React.FC = () => {
  const flashcards: Flashcard[] = [
    { id: 1, question: "What is a neural network?" },
    { id: 2, question: "How does backpropagation work?" },
    { id: 3, question: "What are activation functions and why are they important?" },
    { id: 4, question: "Explain the difference between CNN and RNN architectures." },
    { id: 5, question: "What is the vanishing gradient problem?" },
    { id: 6, question: "How does dropout help prevent overfitting?" },
    { id: 7, question: "What is batch normalization?" },
    { id: 8, question: "Explain the concept of transfer learning." },
    { id: 9, question: "What is the difference between supervised and unsupervised learning?" },
    { id: 10, question: "How do GANs (Generative Adversarial Networks) work?" },
    { id: 11, question: "What is the purpose of an embedding layer?" },
    { id: 12, question: "Explain the concept of attention mechanisms." },
    { id: 13, question: "What is the difference between precision and recall?" },
    { id: 14, question: "How do transformers work?" },
    { id: 15, question: "What is reinforcement learning?" },
    { id: 16, question: "Explain the concept of a loss function." },
    { id: 17, question: "What is the difference between L1 and L2 regularization?" },
    { id: 18, question: "How does LSTM solve the vanishing gradient problem?" },
    { id: 19, question: "What is one-hot encoding?" },
    { id: 20, question: "Explain the concept of a learning rate." },
    { id: 21, question: "What is the difference between bagging and boosting?" },
    { id: 22, question: "How does a self-organizing map work?" },
    { id: 23, question: "What is the curse of dimensionality?" },
    { id: 24, question: "Explain the concept of a decision boundary." },
    { id: 25, question: "What is the difference between a parameter and a hyperparameter?" },
    { id: 26, question: "How does early stopping help prevent overfitting?" },
    { id: 27, question: "What is the role of the activation function in a neural network?" },
    { id: 28, question: "Explain the concept of a feature map in CNNs." },
    {
      id: 29,
      question: "What method was used to validate the hypothesis regarding the fixed source term at amplitude I0?",
    },
    { id: 30, question: "How do you evaluate the performance of a neural network?" },
  ]

  const [currentIndex, setCurrentIndex] = useState(28) // Start at card 29 (index 28)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === flashcards.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="flex items-center border border-gray-700 rounded-xl justify-center">
      <div className="relative w-full max-w-3xl aspect-[16/9]  text-white">
        <div className="absolute inset-0 flex items-center justify-center p-8 ">
          <p className="text-center text-lg md:text-xl">{flashcards[currentIndex].question}</p>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center text-sm">
          <button
            onClick={goToPrevious}
            className="absolute left-4 text-white hover:text-gray-300 focus:outline-none"
            aria-label="Previous flashcard"
          >
            <ChevronLeft size={24} />
          </button>

          <span>
            {currentIndex + 1} / {flashcards.length}
          </span>

          <button
            onClick={goToNext}
            className="absolute right-4 text-white hover:text-gray-300 focus:outline-none"
            aria-label="Next flashcard"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}
