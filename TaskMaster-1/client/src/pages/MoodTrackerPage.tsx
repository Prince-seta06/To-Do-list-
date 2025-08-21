import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "../components/Dashboard/Header";
import Sidebar from "../components/Dashboard/Sidebar";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  BarChart,
  Smile,
  Meh,
  Frown,
} from "lucide-react";

// Mood emoji mapping
const moodEmojis: Record<string, string> = {
  "1": "😣", // Very sad
  "2": "😞", // Sad
  "3": "😐", // Neutral
  "4": "😊", // Happy
  "5": "😄", // Very happy
};

// Color mapping for moods
const moodColors: Record<string, string> = {
  "1": "bg-red-200 text-red-700", // Very sad
  "2": "bg-orange-200 text-orange-700", // Sad
  "3": "bg-yellow-200 text-yellow-700", // Neutral
  "4": "bg-green-200 text-green-700", // Happy
  "5": "bg-blue-200 text-blue-700", // Very happy
};

interface MoodEntry {
  id: number;
  userId: number;
  date: string;
  mood: string;
  energyLevel: number;
  productivityRating: number;
  notes: string | null;
  completedTasks: number | null;
  createdTasks: number | null;
  createdAt: Date | null;
}

interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  recentCompletedTasks: number;
  completionRate: number;
  avgMood: number;
  avgProductivity: number;
  avgCompletedTasksPerDay: number;
  moodEntries: number;
  period: 'day' | 'week' | 'month';
}

const MoodTrackerPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [moodValue, setMoodValue] = useState("3");
  const [energyValue, setEnergyValue] = useState<number[]>([5]);
  const [productivityValue, setProductivityValue] = useState<number[]>([5]);
  const [notesValue, setNotesValue] = useState("");
  const [statsPeriod, setStatsPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState("log");

  // Format dates for API
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

  // Fetch mood entries for the current month
  const { data: moodEntries, refetch: refetchMoodEntries } = useQuery<MoodEntry[]>({
    queryKey: ['/api/mood-entries', startDate, endDate],
    queryFn: () => apiRequest<MoodEntry[]>('GET', `/api/mood-entries?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!user
  });

  // Fetch mood entry for selected date
  const { data: selectedMoodEntry, refetch: refetchSelectedEntry } = useQuery<MoodEntry | undefined>({
    queryKey: ['/api/mood-entries/date', formattedDate],
    queryFn: () => apiRequest<MoodEntry>('GET', `/api/mood-entries/date/${formattedDate}`),
    enabled: !!user && !!formattedDate,
    retry: false
  });

  // Handle mood entry loading and data
  useEffect(() => {
    if (selectedMoodEntry) {
      // Set form values from existing entry
      setMoodValue(selectedMoodEntry.mood);
      setEnergyValue([selectedMoodEntry.energyLevel]);
      setProductivityValue([selectedMoodEntry.productivityRating]);
      setNotesValue(selectedMoodEntry.notes || "");
    } else if (formattedDate) {
      // Clear form values if no entry exists
      setMoodValue("3");
      setEnergyValue([5]);
      setProductivityValue([5]);
      setNotesValue("");
    }
  }, [selectedMoodEntry, formattedDate]);

  // Fetch productivity stats
  const { data: productivityStats } = useQuery<ProductivityStats | undefined>({
    queryKey: ['/api/productivity-stats', statsPeriod],
    queryFn: () => apiRequest<ProductivityStats>('GET', `/api/productivity-stats?period=${statsPeriod}`),
    enabled: !!user && activeTab === "stats"
  });

  // Create mood entry mutation
  const createMoodEntry = useMutation({
    mutationFn: (moodData: any) => 
      apiRequest<MoodEntry>('POST', '/api/mood-entries', moodData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mood-entries/date'] });
      queryClient.invalidateQueries({ queryKey: ['/api/productivity-stats'] });
      toast({
        title: "Mood logged successfully",
        description: "Your mood has been recorded for today",
      });
      refetchMoodEntries();
      refetchSelectedEntry();
    },
    onError: (error: any) => {
      console.error("Error creating mood entry:", error);
      if (error.response?.status === 409) {
        toast({
          title: "Mood already logged",
          description: "You've already logged your mood for this date. You can edit it instead.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error logging mood",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  // Update mood entry mutation
  const updateMoodEntry = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest<MoodEntry>('PUT', `/api/mood-entries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mood-entries/date'] });
      queryClient.invalidateQueries({ queryKey: ['/api/productivity-stats'] });
      toast({
        title: "Mood updated successfully",
        description: "Your mood has been updated",
      });
      refetchMoodEntries();
      refetchSelectedEntry();
    },
    onError: (error: any) => {
      console.error("Error updating mood entry:", error);
      toast({
        title: "Error updating mood",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!selectedDate) {
      toast({
        title: "No date selected",
        description: "Please select a date to log your mood",
        variant: "destructive"
      });
      return;
    }

    const moodData = {
      date: formattedDate,
      mood: moodValue,
      energyLevel: energyValue[0],
      productivityRating: productivityValue[0],
      notes: notesValue || null
    };

    if (selectedMoodEntry) {
      // Update existing entry
      updateMoodEntry.mutate({ id: selectedMoodEntry.id, data: moodData });
    } else {
      // Create new entry
      createMoodEntry.mutate(moodData);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Generate calendar day styling based on mood entries
  const getDayClass = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const entry = moodEntries?.find(entry => entry.date === dateString);
    
    if (entry) {
      return moodColors[entry.mood] || "";
    }
    
    return "";
  };

  const isSubmitDisabled = 
    createMoodEntry.isPending || 
    updateMoodEntry.isPending || 
    !selectedDate;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Mood Tracker" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="log">Log Mood</TabsTrigger>
              <TabsTrigger value="stats">Productivity Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="log" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendar Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Mood Calendar</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                          {format(currentDate, "MMMM yyyy")}
                        </span>
                        <Button variant="outline" size="icon" onClick={handleNextMonth}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Select a date to log or view your mood
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      modifiers={{
                        hasEntry: date => moodEntries?.some(
                          entry => entry.date === format(date, "yyyy-MM-dd")
                        ) || false
                      }}
                      modifiersClassNames={{
                        hasEntry: "font-bold"
                      }}
                      components={{
                        DayContent: ({ date }) => {
                          const dayClass = getDayClass(date);
                          return (
                            <div className={`h-9 w-9 p-0 font-normal flex items-center justify-center rounded-full transition-colors ${dayClass}`}>
                              {date.getDate()}
                            </div>
                          );
                        }
                      }}
                    />
                  </CardContent>
                </Card>
                
                {/* Mood Logging Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>How are you feeling?</CardTitle>
                    <CardDescription>
                      {selectedDate 
                        ? `Log your mood for ${format(selectedDate, "MMMM d, yyyy")}`
                        : "Select a date on the calendar"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Mood Selection */}
                    <div className="space-y-2">
                      <Label>Mood</Label>
                      <div className="flex justify-between gap-2">
                        {Object.entries(moodEmojis).map(([value, emoji]) => (
                          <Button
                            key={value}
                            type="button"
                            variant={moodValue === value ? "default" : "outline"}
                            className={`text-2xl h-14 w-full ${moodValue === value ? "" : "hover:bg-gray-100"}`}
                            onClick={() => setMoodValue(value)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Energy Level */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Energy Level</Label>
                        <span className="text-sm text-gray-500">
                          {energyValue[0]}/10
                        </span>
                      </div>
                      <Slider
                        defaultValue={[5]}
                        max={10}
                        step={1}
                        value={energyValue}
                        onValueChange={setEnergyValue}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                    
                    {/* Productivity Rating */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Productivity Rating</Label>
                        <span className="text-sm text-gray-500">
                          {productivityValue[0]}/10
                        </span>
                      </div>
                      <Slider
                        defaultValue={[5]}
                        max={10}
                        step={1}
                        value={productivityValue}
                        onValueChange={setProductivityValue}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Unproductive</span>
                        <span>Very Productive</span>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="How was your day? Any notable achievements or challenges?"
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={isSubmitDisabled}
                    >
                      {selectedMoodEntry ? "Update Mood" : "Log Mood"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Productivity Analytics</h2>
                <Select value={statsPeriod} onValueChange={(value: 'day' | 'week' | 'month') => setStatsPeriod(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Last 24 Hours</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Task Completion Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Task Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-3xl font-bold">
                        {productivityStats?.completedTasks ?? 0}
                        <span className="text-sm text-gray-500 ml-2">
                          / {productivityStats?.totalTasks ?? 0} tasks
                        </span>
                      </div>
                      <Progress
                        value={productivityStats?.completionRate ?? 0}
                        className="h-2"
                      />
                      <p className="text-sm text-gray-500">
                        {productivityStats?.completionRate ? productivityStats.completionRate.toFixed(0) : 0}% completion rate
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Mood Average Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Average Mood</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-5xl mb-2">
                        {productivityStats?.avgMood
                          ? moodEmojis[Math.round(productivityStats.avgMood).toString()]
                          : moodEmojis['3']
                        }
                      </div>
                      <p className="text-sm text-gray-500">
                        Based on {productivityStats?.moodEntries ?? 0} entries
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Productivity Average Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Productivity Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-3xl font-bold">
                        {productivityStats?.avgProductivity ? productivityStats.avgProductivity.toFixed(1) : 0}
                        <span className="text-sm text-gray-500 ml-2">/ 10</span>
                      </div>
                      <Progress
                        value={(productivityStats?.avgProductivity ?? 0) * 10}
                        className="h-2"
                      />
                      <p className="text-sm text-gray-500">
                        Average self-reported productivity
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Insights Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Insights</CardTitle>
                  <CardDescription>
                    Analysis based on your mood and task completion data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-1">Completed Tasks</h3>
                      <p className="text-blue-600 text-sm">
                        {productivityStats?.avgCompletedTasksPerDay 
                          ? `You complete an average of ${productivityStats.avgCompletedTasksPerDay.toFixed(1)} tasks per day.`
                          : "Start logging mood and completing tasks to see insights."
                        }
                      </p>
                    </div>
                    
                    {productivityStats && productivityStats.moodEntries > 0 && (
                      <>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h3 className="font-medium text-green-800 mb-1">Recent Achievement</h3>
                          <p className="text-green-600 text-sm">
                            You've completed {productivityStats.recentCompletedTasks} tasks in the past {statsPeriod === 'day' ? 'day' : statsPeriod === 'week' ? 'week' : 'month'}.
                          </p>
                        </div>
                        
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h3 className="font-medium text-purple-800 mb-1">Mood Correlation</h3>
                          <p className="text-purple-600 text-sm">
                            {productivityStats.avgMood > 3 
                              ? "Your average mood is positive! This often correlates with higher productivity."
                              : "Your average mood could be better. Consider taking breaks and practicing self-care."}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default MoodTrackerPage;