# Momentum AI

Momentum AI is an intelligent productivity application designed to help you achieve a state of "flow" by aligning your daily tasks with your self-reported energy levels. The core philosophy is to work smarter, not just harder. By tackling tasks that are best suited for your current mental and physical state, the app helps you build momentum, maintain motivation, and achieve your goals more effectively.

## Key Features

The application is built around a daily workday workflow with several integrated modules that provide a holistic and AI-enhanced productivity experience.

### 1. Workday Page: Your Daily Command Center

This is the landing page where you plan and execute your daily work.

-   **Energy Input**: Report your current energy level (Low, Medium, or High). This single input is the primary driver for the app's AI-powered recommendations.
-   **AI-Powered Task Suggestions**: Based on your energy input, the AI analyzes your task list and intelligently suggests the tasks that are most appropriate for you to work on right now.
-   **Workday Task Planning**: Manually select tasks from your full task list (including regular, recurring, and weekly planner tasks) to add to today's workday.
-   **Pomodoro Timer**: An integrated timer to help you use the Pomodoro Technique. You can select a task to focus on, and the timer will track your work sessions.
-   **Momentum Card**: Displays your **Daily Momentum Score**, which is calculated by an AI based on how well your completed tasks aligned with your reported energy. It also tracks your **streak** of productive days.
-   **Projects Overview**: A quick, at-a-glance carousel view of all your projects, each showing its completion percentage.
-   **End Day Button**: When you finish your workday, this collects notes for all completed and incomplete tasks, then generates an AI-powered daily report with insights and encouragement.

### 2. Dashboard: Reports & Analytics

A unified view combining your historical reports and productivity analytics.

**Reports Section:**
-   **Reports History**: Carousel view of all your daily work reports
-   **Report Details**: View detailed summaries with task breakdowns
-   **Email Reports**: Generate and send reports via email

**Analytics Section:**
-   **Productivity Stats**:
    - Total tasks completed
    - Most productive day of the week
    - Energy sweet spot (your most productive energy level)
    - Top category
-   **Weekly Completion Chart**: Bar chart showing tasks completed per day of the week
-   **Category Breakdown**: Pie chart showing how your tasks are distributed across categories
-   **Activity Overview**: Recent accomplishments and upcoming deadlines
-   **Flow Visualizer**: AI-generated insights analyzing your task-energy alignment over time

### 3. Projects Page

A dedicated section for high-level organization of your work.

-   **Create & Manage Projects**: Group related tasks together under different projects (e.g., "Q3 Marketing Campaign," "Personal Health Goals").
-   **Track Progress**: Each project is displayed as a card showing its overall progress with a radial chart, giving you an immediate sense of what's outstanding.
-   **Priority Levels**: Assign Low, Medium, or High priority to projects.

### 4. Recurring Tasks Page

Manage tasks that happen on a regular basis without having to create them manually each time.

-   **Weekly & Monthly Tabs**: Organize tasks based on their frequency.
-   **Status Tracking**: The system automatically tracks whether a recurring task has been completed for the current period (week or month).
-   **Auto-Reset**: Completion status resets automatically at the start of a new week or month.
-   **Integration**: Recurring tasks can be added to your daily workday alongside regular tasks.

### 5. Weekly Planner Page

Visualize and organize your tasks across a 7-day grid, providing a clear overview of your week.

-   **7-Day Grid View**: Each day of the current week is displayed as a column, showing all tasks with a deadline on that day.
-   **Quick Task Creation**: Add tasks directly to specific days with inline input or detailed task form.
-   **At-a-Glance Overview**: Quickly see which days are busy and which are lighter, helping you to balance your workload.
-   **Integration**: Weekly planner tasks can be added to your daily workday.

### 6. Profile Page

Manage your user profile and preferences.

-   **Profile Management**: Update your display name and view account details
-   **Theme Toggle**: Switch between light and dark modes
-   **Sign Out**: Securely log out of your account

## Daily Workflow

Momentum AI is designed around a focused daily workflow:

1. **Start Your Day**: Open the Workday page and report your energy level
2. **Plan Your Workday**: Add tasks to today's workday from your task list, recurring tasks, or weekly planner
3. **Execute**: Complete tasks with the Pomodoro timer, checking them off as you go
4. **End Your Day**: Click "End Day" to add notes about what you accomplished and what you didn't complete
5. **Generate Report**: The AI creates a comprehensive daily report with insights and encouragement
6. **Review Analytics**: Visit the Dashboard to see your progress over time and identify patterns

## Technical Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript 5](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
-   **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Generative AI**: [Google Gemini 2.5 Flash](https://ai.google.dev/) via [Genkit 1.21](https://firebase.google.com/docs/genkit)
-   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (NoSQL cloud database)
-   **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Email/Password)
-   **Email**: [Resend](https://resend.com/) for report generation

## Data Architecture

The app uses Firebase Firestore with a user-scoped data model:

```
/users/{userId}/
  ├── tasks/              # Regular tasks
  ├── workday-tasks/      # Tasks selected for specific workdays
  ├── projects/           # Project groupings
  ├── recurring-tasks/    # Weekly/monthly recurring tasks
  ├── energy-log/         # Daily energy level tracking
  ├── momentum/           # Daily momentum scores
  ├── reports/            # Daily work reports with notes
  └── categories/         # Task categories (static)
```

All data is strictly isolated per user with Firestore security rules enforcing user-only access.

## AI Flows

The app includes three AI-powered flows:

1. **scoreAndSuggestTasks**: Analyzes tasks and suggests the top 3 based on energy level, urgency, and project priority
2. **calculateDailyMomentumScore**: Generates a score (0-150) based on task-energy alignment with streak bonuses
3. **generateEndOfDayReport**: Creates comprehensive daily reports from task completion and user notes
4. **visualizeFlowAlignment**: Provides AI productivity coaching based on historical patterns

## Getting Started

### Prerequisites

-   Node.js 18+ and npm
-   Firebase project with Firestore and Authentication enabled
-   Google AI API key for Gemini

### Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd momentum-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root directory with:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    GOOGLE_GENAI_API_KEY=your_gemini_api_key
    ```

4.  **Deploy Firestore security rules**:
    ```bash
    firebase deploy --only firestore:rules
    ```

5.  **Run the development server**:
    ```bash
    npm run dev
    ```

6.  **Open the app**:
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Building for Production

```bash
npm run build
npm start
```

## Testing

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own productivity needs!
