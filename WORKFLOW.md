# ZP Fit Admin Workflow Guide

This document explains how the admin dashboard supports Zach's training program workflow.

## Complete Workflow: Program → Days → Exercises

### Step 1: Create a Program
1. Navigate to `/admin`
2. Click **"New Program"**
3. Fill in:
   - Program name (e.g., "8-Week Strength Builder")
   - Description (e.g., "Progressive strength program for intermediate lifters")
   - Upload thumbnail
4. Click **"Create Program"**

### Step 2: Add Days to the Program
1. Click on the program from the dashboard
2. In the "Days" section on the right, click **"Add Day"**
3. For each day, provide:
   - Title (e.g., "Upper Body Power", "Rest Day", "Full Body HIIT")
   - Thumbnail image
4. Add as many days as needed (e.g., Monday workout, Tuesday rest, Wednesday workout, etc.)

### Step 3: Add Exercises to Each Day
1. Click **"Edit"** on a specific day
2. Click **"Add Exercise"** to see the exercise library
3. Select exercises from the library to add to this day
4. Reorder exercises using the up/down arrow buttons
5. Remove exercises if needed with the trash icon
6. Click **"Save Changes"**

### Step 4: Create Exercises (Library)
Before adding exercises to days, you need to create them:

1. Navigate to `/admin/exercises`
2. Click **"New Exercise"**
3. Fill in:
   - Exercise name (e.g., "Barbell Bench Press")
   - Sets (e.g., 3)
   - Reps (e.g., 10)
   - Time (optional, in seconds)
   - Distance (optional, in meters)
   - **Upload video** (Cloudflare Stream)
   - **Upload thumbnail** (Cloudflare R2)
4. Click **"Create Exercise"**

## Example Scenario

**Zach wants to create a new 4-week program:**

1. **Create Program**: "4-Week Bodyweight Challenge"
2. **Add Days**:
   - Day 1: "Push Day - Chest & Triceps"
   - Day 2: "Pull Day - Back & Biceps"  
   - Day 3: "Rest & Stretch"
   - Day 4: "Leg Day - Quads & Glutes"
   - Day 5: "HIIT & Core"
   - Day 6: "Active Recovery"
   - Day 7: "Rest Day"
3. **For Day 1 "Push Day"**, add exercises:
   - Push-ups (3 sets x 15 reps)
   - Tricep Dips (3 sets x 12 reps)
   - Diamond Push-ups (3 sets x 10 reps)
   - Plank Hold (3 sets x 60 seconds)
4. **For Day 3 "Rest & Stretch"**, add:
   - No exercises, or light stretching routines
5. Repeat for all other days

## How Users See It in the iOS App

When a user subscribes to the **"4-Week Bodyweight Challenge"**:
- They see the program with all 28 days (7 days × 4 weeks)
- On Day 1, they get the exact 4 exercises Zach configured
- Each exercise has a video demonstration and instructions
- They can mark exercises as complete as they work through the day
- The app automatically progresses them to Day 2, then Day 3, etc.

## Key Features

✅ **Unlimited Programs**: Create as many training programs as needed  
✅ **Unlimited Days**: Each program can have any number of days  
✅ **Unlimited Exercises per Day**: Add as many exercises as needed for each day  
✅ **Reusable Exercise Library**: Create exercises once, use them across multiple programs and days  
✅ **Real-time Sync**: Changes instantly reflect in the iOS app via Firestore  
✅ **Rich Media**: Every exercise has video (Stream) and thumbnail (R2)  
✅ **Flexible Scheduling**: Monday workout, Tuesday rest, Wednesday workout, etc.

## Data Structure

The Firestore structure is:

```
programs/{programId}
  ├── name, description, thumbnailUrl, createdAt
  └── days/{dayId}
        ├── dayNumber, title, thumbnailUrl
        └── exerciseIds: [array of exercise IDs]

exercises/{exerciseId}
  └── name, sets, reps, time, distance, videoUrl, thumbnailUrl
```

This allows:
- **Programs** to have multiple **Days**
- **Days** to reference multiple **Exercises**
- **Exercises** to be shared across multiple programs and days
