"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { CalendarEvent } from "@/types/applicationTypes";
import {
  getCalendarEventsByDateRangeAction,
  createCalendarEventAction,
  deleteCalendarEventAction,
  type CreateCalendarEventSchema
} from "@/actions/calendarActions";

interface CalendarViewProps {
  initialEvents: any[];
}

export function CalendarView({ initialEvents }: CalendarViewProps) {
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState<CreateCalendarEventSchema>({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    all_day: false,
    color: "#3b82f6",
  });

  // ----------------------
  // Načtení eventů pro aktuální měsíc
  // ----------------------
  useEffect(() => {
    loadEventsForMonth();
  }, [currentDate]);

  const loadEventsForMonth = async () => {
    setLoading(true);
    try {
      const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
      const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd'T'HH:mm:ss");

      const result = await getCalendarEventsByDateRangeAction(startDate, endDate);

      if (result.success && result.data) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // Pomocné funkce
  // ----------------------
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start_time), day));
  };

  const formatDateTimeForInput = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const handleStartTimeChange = (value: string) => {
    const start = new Date(value);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hodina

    setNewEvent(prev => ({
      ...prev,
      start_time: value,
      end_time: prev.end_time || formatDateTimeForInput(end)
    }));
  };

  const createEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start_time || !newEvent.end_time) return;

    try {
      const eventData: CreateCalendarEventSchema = { ...newEvent };
      const result = await createCalendarEventAction(eventData);

      if (result.success && result.data) {
        setEvents(prev => [result.data, ...prev]);
        setNewEvent({
          title: "",
          description: "",
          start_time: "",
          end_time: "",
          all_day: false,
          color: "#3b82f6",
        });
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const result = await deleteCalendarEventAction(id);

      if (result.success) {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // ----------------------
  // Calendar calculations
  // ----------------------
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Add a new event to your calendar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Title</label>
              <Input
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Description</label>
              <Input
                placeholder="Enter description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Start Time</label>
                <Input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">End Time</label>
                <Input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Color</label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={newEvent.color}
                  onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">{newEvent.color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={createEvent} disabled={!newEvent.title.trim()}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4 text-muted-foreground">Loading events...</div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
        ))}

        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={`min-h-[100px] rounded-lg border p-2 ${
                isCurrentMonth ? "bg-background hover:bg-muted/50" : "bg-muted/30 text-muted-foreground"
              } ${isToday ? "border-2 border-primary" : "border-border"}`}
            >
              <div className={`mb-1 text-sm ${isToday ? "font-bold text-primary" : isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}>
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group relative cursor-pointer rounded px-1 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${event.color || '#3b82f6'}20`,
                      borderLeft: `3px solid ${event.color || '#3b82f6'}`,
                    }}
                  >
                    <div className="truncate font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {format(new Date(event.start_time), 'HH:mm')}
                      {event.end_time ? ` - ${format(new Date(event.end_time), 'HH:mm')}` : ''}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                      className="absolute -right-1 -top-1 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
