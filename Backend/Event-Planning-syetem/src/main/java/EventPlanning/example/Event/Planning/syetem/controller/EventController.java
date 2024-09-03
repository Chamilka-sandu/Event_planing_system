package EventPlanning.example.Event.Planning.syetem.controller;

import EventPlanning.example.Event.Planning.syetem.model.Event;
import EventPlanning.example.Event.Planning.syetem.model.Group;
import EventPlanning.example.Event.Planning.syetem.model.User;
import EventPlanning.example.Event.Planning.syetem.repository.EventRepository;
import EventPlanning.example.Event.Planning.syetem.service.EventService;
import EventPlanning.example.Event.Planning.syetem.repository.UserRepository;
import EventPlanning.example.Event.Planning.syetem.repository.GroupRepository;
import EventPlanning.example.Event.Planning.syetem.service.GroupService;
import EventPlanning.example.Event.Planning.syetem.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventService eventService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;


    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            Event createdEvent = eventService.createEvent(event);
            return ResponseEntity.status(201).body(createdEvent);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating event");
        }
    }




    // Get all events
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        try {
            List<Event> events = eventService.getAllEvents();
            if (events.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(events, HttpStatus.OK);
        } catch (Exception e) {
            // Consider logging the error here
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get a single event by ID
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable("id") Long id) {
        Optional<Event> eventData = eventService.getEventById(id);

        if (eventData.isPresent()) {
            return new ResponseEntity<>(eventData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEvent(@PathVariable("id") Long id) {
        try {
            // Attempt to delete the event
            eventService.deleteEvent(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Return 204 No Content if deletion is successful
        } catch (EntityNotFoundException e) {
            // Return 404 if the event was not found
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            // Handle other errors and log if necessary
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event eventDetails) {
        try {
            // Update the event
            Event updatedEvent = eventService.updateEvent(id, eventDetails);

            // Return the updated event in the response
            return new ResponseEntity<>(updatedEvent, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            // Return 404 if the event was not found
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            // Handle other errors and log if necessary
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
