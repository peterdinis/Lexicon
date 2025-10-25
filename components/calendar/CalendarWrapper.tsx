"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  parseISO,
  isBefore,
  isAfter,
  isEqual,
  addHours,
  startOfDay,
  endOfDay,
  isValid,
} from "date-fns";
import {
  getCalendarEventsByDateRangeAction,
  createCalendarEventAction,
  deleteCalendarEventAction,
  updateCalendarEventAction,
} from "@/actions/calendarActions";

interface CalendarViewProps {
  initialEvents: any[];
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color?: string | null;
}

interface CreateCalendarEventData {
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color?: string | null;
}

interface ValidationErrors {
  title?: string;
  start_time?: string;
  end_time?: string;
}

export function CalendarView({ initialEvents }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState<CreateCalendarEventData>({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    all_day: false,
    color: "#3b82f6",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  // Memoizovaný dátumový rozsah
  const dateRange = useMemo(() => {
    return {
      startDate: format(startOfMonth(currentDate), "yyyy-MM-dd'T'HH:mm:ss"),
      endDate: format(endOfMonth(currentDate), "yyyy-MM-dd'T'HH:mm:ss"),
    };
  }, [currentDate]);

  // Načítanie eventov s useCallback
  const loadEventsForMonth = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCalendarEventsByDateRangeAction(dateRange);

      if (result?.data) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadEventsForMonth();
  }, [loadEventsForMonth]);

  // Memoizovaná funkcia pre eventy podľa dňa
  const getEventsForDay = useCallback(
    (day: Date) => {
      return events.filter((event) => {
        if (!event.start_time) return false;
        return isSameDay(parseISO(event.start_time), day);
      });
    },
    [events],
  );

  const formatDateTimeForInput = useCallback((date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  }, []);

  // Validácia eventu
  const validateEvent = useCallback(
    (eventData: CreateCalendarEventData | CalendarEvent): ValidationErrors => {
      const errors: ValidationErrors = {};

      // Validácia titulu
      if (!eventData.title.trim()) {
        errors.title = "Title is required";
      }

      // Validácia dátumov
      if (!eventData.start_time) {
        errors.start_time = "Start time is required";
      } else if (!eventData.end_time) {
        errors.end_time = "End time is required";
      } else {
        const startDate = new Date(eventData.start_time);
        const endDate = new Date(eventData.end_time);
        const now = new Date();

        // Validácia platnosti dátumov
        if (!isValid(startDate)) {
          errors.start_time = "Invalid start date";
        } else if (!isValid(endDate)) {
          errors.end_time = "Invalid end date";
        } else {
          // Event nemôže začínať v minulosti
          if (isBefore(startDate, startOfDay(now))) {
            errors.start_time = "Event cannot start in the past";
          }

          // End time nemôže byť pred start time
          if (isBefore(endDate, startDate)) {
            errors.end_time = "End time must be after start time";
          }

          // Minimálna dĺžka eventu (5 minút)
          const minDuration = 5 * 60 * 1000; // 5 minút v milisekundách
          if (endDate.getTime() - startDate.getTime() < minDuration) {
            errors.end_time = "Event must be at least 5 minutes long";
          }
        }
      }

      return errors;
    },
    [],
  );

  const handleStartTimeChange = useCallback(
    (value: string) => {
      const start = new Date(value);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hodina

      setNewEvent((prev) => ({
        ...prev,
        start_time: value,
        end_time: prev.end_time || formatDateTimeForInput(end),
      }));

      // Clear validation errors when user types
      setValidationErrors((prev) => ({
        ...prev,
        start_time: undefined,
        end_time: undefined,
      }));
    },
    [formatDateTimeForInput],
  );

  // Vytvorenie eventu
  const createEvent = async () => {
    const errors = validateEvent(newEvent);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!newEvent.title.trim() || !newEvent.start_time || !newEvent.end_time)
      return;

    try {
      const eventData: CreateCalendarEventData = {
        ...newEvent,
        description: newEvent.description || null,
        color: newEvent.color || null,
      };

      const result = await createCalendarEventAction(eventData);

      if (result) {
        await loadEventsForMonth();
        setNewEvent({
          title: "",
          description: "",
          start_time: "",
          end_time: "",
          all_day: false,
          color: "#3b82f6",
        });
        setValidationErrors({});
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // Aktualizácia eventu
  const updateEvent = async () => {
    if (!selectedEvent) return;

    const errors = validateEvent(selectedEvent);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const result = await updateCalendarEventAction({
        id: selectedEvent.id,
        title: selectedEvent.title,
        description: selectedEvent.description,
        start_time: selectedEvent.start_time,
        end_time: selectedEvent.end_time,
        all_day: selectedEvent.all_day,
        color: selectedEvent.color,
      });

      if (result) {
        await loadEventsForMonth();
        setDetailDialogOpen(false);
        setSelectedEvent(null);
        setValidationErrors({});
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  // Vymazanie eventu
  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const result = await deleteCalendarEventAction({ id });

      if (result.data !== false) {
        await loadEventsForMonth();
        setDetailDialogOpen(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Otvorenie detailu eventu
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setValidationErrors({});
    setDetailDialogOpen(true);
  }, []);

  // Otvorenie create dialogu
  const handleOpenCreateDialog = useCallback(() => {
    setNewEvent({
      title: "",
      description: "",
      start_time: formatDateTimeForInput(new Date()),
      end_time: formatDateTimeForInput(addHours(new Date(), 1)),
      all_day: false,
      color: "#3b82f6",
    });
    setValidationErrors({});
    setCreateDialogOpen(true);
  }, [formatDateTimeForInput]);

  // Kalendárne dátumy memoizované
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  }, [currentDate]);

  // Minimálny dátum pre datetime input (aktuálny čas)
  const minDateTime = useMemo(() => {
    return formatDateTimeForInput(new Date());
  }, [formatDateTimeForInput]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to your calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Title *</label>
              <Input
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => {
                  setNewEvent({ ...newEvent, title: e.target.value });
                  setValidationErrors((prev) => ({
                    ...prev,
                    title: undefined,
                  }));
                }}
                className={validationErrors.title ? "border-destructive" : ""}
              />
              {validationErrors.title && (
                <p className="text-sm text-destructive mt-1">
                  {validationErrors.title}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <Textarea
                placeholder="Enter description (optional)"
                value={newEvent.description || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Start Time *
                </label>
                <Input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  min={minDateTime}
                  className={
                    validationErrors.start_time ? "border-destructive" : ""
                  }
                />
                {validationErrors.start_time && (
                  <p className="text-sm text-destructive mt-1">
                    {validationErrors.start_time}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  End Time *
                </label>
                <Input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => {
                    setNewEvent({ ...newEvent, end_time: e.target.value });
                    setValidationErrors((prev) => ({
                      ...prev,
                      end_time: undefined,
                    }));
                  }}
                  min={newEvent.start_time || minDateTime}
                  className={
                    validationErrors.end_time ? "border-destructive" : ""
                  }
                />
                {validationErrors.end_time && (
                  <p className="text-sm text-destructive mt-1">
                    {validationErrors.end_time}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Color</label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={newEvent.color || "#3b82f6"}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, color: e.target.value })
                  }
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">
                  {newEvent.color}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={createEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View and edit your event details
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title *
                </label>
                <Input
                  value={selectedEvent.title}
                  onChange={(e) => {
                    setSelectedEvent({
                      ...selectedEvent,
                      title: e.target.value,
                    });
                    setValidationErrors((prev) => ({
                      ...prev,
                      title: undefined,
                    }));
                  }}
                  className={validationErrors.title ? "border-destructive" : ""}
                />
                {validationErrors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {validationErrors.title}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <Textarea
                  value={selectedEvent.description || ""}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Start Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(
                      parseISO(selectedEvent.start_time),
                    )}
                    onChange={(e) => {
                      setSelectedEvent({
                        ...selectedEvent,
                        start_time: e.target.value,
                      });
                      setValidationErrors((prev) => ({
                        ...prev,
                        start_time: undefined,
                      }));
                    }}
                    className={
                      validationErrors.start_time ? "border-destructive" : ""
                    }
                  />
                  {validationErrors.start_time && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.start_time}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    End Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(
                      parseISO(selectedEvent.end_time),
                    )}
                    onChange={(e) => {
                      setSelectedEvent({
                        ...selectedEvent,
                        end_time: e.target.value,
                      });
                      setValidationErrors((prev) => ({
                        ...prev,
                        end_time: undefined,
                      }));
                    }}
                    className={
                      validationErrors.end_time ? "border-destructive" : ""
                    }
                  />
                  {validationErrors.end_time && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.end_time}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Color</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={selectedEvent.color || "#3b82f6"}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        color: e.target.value,
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedEvent.color}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => selectedEvent && deleteEvent(selectedEvent.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDetailDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={updateEvent}>
                <Edit className="mr-2 h-4 w-4" />
                Update Event
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4 text-muted-foreground">
          Loading events...
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={`min-h-[100px] rounded-lg border p-2 ${
                isCurrentMonth
                  ? "bg-background hover:bg-muted/50"
                  : "bg-muted/30 text-muted-foreground"
              } ${isToday ? "border-2 border-primary" : "border-border"}`}
            >
              <div
                className={`mb-1 text-sm ${
                  isToday
                    ? "font-bold text-primary"
                    : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group relative cursor-pointer rounded px-1 py-0.5 text-xs hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: `${event.color || "#3b82f6"}20`,
                      borderLeft: `3px solid ${event.color || "#3b82f6"}`,
                    }}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="truncate font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {event.start_time
                        ? format(parseISO(event.start_time), "HH:mm")
                        : ""}
                      {event.end_time && event.start_time
                        ? ` - ${format(parseISO(event.end_time), "HH:mm")}`
                        : ""}
                    </div>
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
