
# Video Sharing Platform

## Overview

This application is a video sharing platform that allows users to upload, view, and share videos. It features a modern, clean, and intuitive design with a responsive layout for both mobile and web, built with Next.js and Firebase.

## Features Implemented

* **User Authentication:**
    * User signup and login with email and password using Firebase Authentication.
    * Server-side authentication logic handled with Next.js Server Actions.
    * A global `useAuth` hook provides authentication state to all components.
    * The navigation bar dynamically changes to show relevant links based on the user's authentication status (Login/Signup vs. Upload/Sign Out).

* **Video Uploading:**
    * A protected `/upload` route exclusively for authenticated users.
    * A user-friendly form to input a video title, description, and select a video file.
    * A robust `uploadVideo` server action that uploads the video file to Firebase Storage and saves the video's metadata (title, description, download URL, author) to a `videos` collection in Firestore.

* **Video Browsing and Viewing:**
    * The homepage features a responsive grid of the latest uploaded videos, fetched from Firestore.
    * Each video is presented in a `VideoCard` component, displaying its title, a snippet of the description, and a link to the author's profile.
    * Clicking on a video card leads to a dynamic video page (`/video/[id]`) for an immersive viewing experience.
    * The video page includes an HTML5 video player to watch the video, along with its full title and description.

* **User Profiles:**
    * Dynamic user profile pages are generated at `/user/[userId]`.
    * The profile page displays the user's ID and a grid of all the videos they have uploaded.

## Style and Design

*   **Framework:** Next.js with React (JavaScript).
*   **Styling:** Tailwind CSS for a modern, utility-first, and responsive design.
*   **Color Scheme:** A sleek dark theme with a `bg-gray-900` body and `bg-gray-800` components provides a visually comfortable and premium feel.
*   **Typography:** The 'Inter' font is used for its clean and readable characteristics.
*   **Layout:** Responsive and centered layouts are used throughout the application, ensuring a great experience on all screen sizes.
*   **Components:**
    *   **Navbar:** A clean and intuitive navigation bar.
    *   **Forms:** Consistently styled and easy-to-use forms for authentication and video uploads.
    *   **VideoCard:** A reusable and informative component for displaying videos in a grid layout.

## Project Completion Summary

The development of the video sharing platform is now complete. The following key milestones were achieved:

1.  **Initial Setup & Authentication:** The project was set up, and a complete Firebase-based authentication system was implemented using Server Actions and a global context for state management.

2.  **Video Upload Functionality:** An upload page and a server action were created to allow authenticated users to upload videos to Firebase Storage and save metadata to Firestore.

3.  **Video Display and Playback:** The homepage was populated with a grid of the latest videos, and a dynamic page was created for individual video playback.

4.  **User Profile Pages:** Dynamic user profile pages were implemented to showcase all videos uploaded by a specific user, completing the core feature set of the application.
