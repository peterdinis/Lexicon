"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useOptimistic,
} from "react";
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
  addHours,
  startOfDay,
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

// Upravený interface - zhodný s dátami z databázy
interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  start_time: string; // Zmenené z Date na string
  end_time: string; // Zmenené z Date na string
  all_day: boolean;
  color?: string | null;
  user_id?: string;
  in_trash?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
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

type OptimisticEvent = CalendarEvent & { pending?: boolean };

export function CalendarView({ initialEvents }: CalendarViewProps) {
  // Konverzia initialEvents na správny typ
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    return initialEvents.map(event => ({
      ...event,
      start_time: typeof event.start_time === 'string' 
        ? event.start_time 
        : event.start_time?.toISOString() || new Date().toISOString(),
      end_time: typeof event.end_time === 'string'
        ? event.end_time
        : event.end_time?.toISOString() || new Date().toISOString(),
    }));
  });
  
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

  // Optimistic updates pre eventy
  const [optimisticEvents, addOptimisticEvent] = useOptimistic<
    OptimisticEvent[],
    | { type: "add"; event: CreateCalendarEventData }
    | { type: "update"; event: CalendarEvent }
    | { type: "delete"; id: string }
  >(
    events.map((event) => ({ ...event, pending: false })),
    (state, action) => {
      switch (action.type) {
        case "add":
          const tempId = `temp-${Date.now()}`;
          return [
            ...state,
            {
              ...action.event,
              id: tempId,
              pending: true,
            } as OptimisticEvent,
          ];
        case "update":
          return state.map((event) =>
            event.id === action.event.id
              ? { ...action.event, pending: true }
              : event,
          );
        case "delete":
          return state.map((event) =>
            event.id === action.id ? { ...event, pending: true } : event,
          );
        default:
          return state;
      }
    },
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
        // Konverzia dát na správny typ
        const convertedEvents: CalendarEvent[] = result.data.map((event: any) => ({
          ...event,
          start_time: typeof event.start_time === 'string' 
            ? event.start_time 
            : event.start_time?.toISOString() || new Date().toISOString(),
          end_time: typeof event.end_time === 'string'
            ? event.end_time
            : event.end_time?.toISOString() || new Date().toISOString(),
        }));
        setEvents(convertedEvents);
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
      return optimisticEvents.filter((event) => {
        if (!event.start_time) return false;
        return isSameDay(parseISO(event.start_time), day);
      });
    },
    [optimisticEvents],
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
      // Optimistic update
      addOptimisticEvent({ type: "add", event: newEvent });

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
      // V prípade chyby znova načítame eventy pre synchronizáciu
      await loadEventsForMonth();
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
      // Optimistic update
      addOptimisticEvent({ type: "update", event: selectedEvent });

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
      await loadEventsForMonth();
    }
  };

  // Vymazanie eventu
  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      // Optimistic update
      addOptimisticEvent({ type: "delete", id });

      const result = await deleteCalendarEventAction({ id });

      if (!result.data) {
        await loadEventsForMonth();
        setDetailDialogOpen(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      await loadEventsForMonth();
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

  // Aktuálne eventy pre tabuľku (dnešné a budúce)
  const currentAndUpcomingEvents = useMemo(() => {
    const now = new Date();
    return optimisticEvents
      .filter((event) => {
        const eventDate = parseISO(event.start_time);
        return isAfter(eventDate, startOfDay(now)) || isSameDay(eventDate, now);
      })
      .sort(
        (a, b) =>
          parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime(),
      )
      .slice(0, 10); // Max 10 eventov v tabuľke
  }, [optimisticEvents]);

  return (
    <div className="space-y-6">
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

      {/* Tabuľka aktuálnych eventov */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
        {currentAndUpcomingEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming events</p>
        ) : (
          <div className="space-y-2">
            {currentAndUpcomingEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  event.pending ? "opacity-60" : ""
                }`}
                style={{
                  borderLeft: `4px solid ${event.color || "#3b82f6"}`,
                }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.color || "#3b82f6" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm truncate">
                        {event.title}
                      </p>
                      {event.pending && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Saving...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        parseISO(event.start_time),
                        "MMM d, yyyy 'at' HH:mm",
                      )}
                      {event.end_time &&
                        ` - ${format(parseISO(event.end_time), "HH:mm")}`}
                    </p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEventClick(event)}
                  disabled={event.pending}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
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
                    className={`group relative cursor-pointer rounded px-1 py-0.5 text-xs hover:opacity-80 transition-opacity ${
                      event.pending ? "opacity-60" : ""
                    }`}
                    style={{
                      backgroundColor: `${event.color || "#3b82f6"}20`,
                      borderLeft: `3px solid ${event.color || "#3b82f6"}`,
                    }}
                    onClick={() => !event.pending && handleEventClick(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate font-medium flex-1">
                        {event.title}
                      </div>
                      {event.pending && (
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse ml-1" />
                      )}
                    </div>
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