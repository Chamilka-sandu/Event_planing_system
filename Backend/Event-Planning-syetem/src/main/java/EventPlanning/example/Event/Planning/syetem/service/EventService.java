package EventPlanning.example.Event.Planning.syetem.service;


import EventPlanning.example.Event.Planning.syetem.model.Event;;
import EventPlanning.example.Event.Planning.syetem.model.Group;
import EventPlanning.example.Event.Planning.syetem.model.User;
import EventPlanning.example.Event.Planning.syetem.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
    public Event createEvent(Event event) {
        // Validate and convert group codes to group entities
        List<Group> groups = groupService.getGroupsByCodes(
                event.getInvitedGroups().stream()
                        .map(Group::getGroupCode) // Use groupCode instead of groupId
                        .collect(Collectors.toList())
        );


        // Validate and convert user IDs to user entities
        List<User> users = userService.getUsersByIds(
                event.getInvitedUsers().stream()
                        .map(User::getUserId)
                        .collect(Collectors.toList())
        );

        event.setInvitedGroups(groups);
        event.setInvitedUsers(users);

        return eventRepository.save(event);
    }
    public Event updateEvent(Long id, Event eventDetails) {
        // Fetch the existing event from the repository
        Optional<Event> existingEventOpt = eventRepository.findById(id);
//        if (!existingEventOpt.isPresent()) {
//            throw new EntityNotFoundException("Event not found with id " + id);
//        }

        Event existingEvent = existingEventOpt.get();

        // Update the fields of the existing event
        existingEvent.setEventTitle(eventDetails.getEventTitle());
        existingEvent.setDescription(eventDetails.getDescription());
        existingEvent.setDateTime(eventDetails.getDateTime());
        existingEvent.setVenue(eventDetails.getVenue());
        existingEvent.setEventType(eventDetails.getEventType());
        existingEvent.setIsPublic(eventDetails.getIsPublic());
        existingEvent.setInviteType(eventDetails.getInviteType());
        existingEvent.setStatus(eventDetails.getStatus());

        // Update invited groups
        if (eventDetails.getInvitedGroups() != null) {
            List<Group> groups = groupService.getGroupsByCodes(
                    eventDetails.getInvitedGroups().stream()
                            .map(Group::getGroupCode) // Use groupCode instead of groupId
                            .collect(Collectors.toList())
            );
            existingEvent.setInvitedGroups(groups);
        }

        // Update invited users
        if (eventDetails.getInvitedUsers() != null) {
            List<User> users = userService.getUsersByIds(
                    eventDetails.getInvitedUsers().stream()
                            .map(User::getUserId)
                            .collect(Collectors.toList())
            );
            existingEvent.setInvitedUsers(users);
        }

        // Save the updated event
        return eventRepository.save(existingEvent);
    }

    // Optional: Method to delete associations if needed
    public void deleteEventAssociations(Long id) {
        // Implement if there are any associations to handle before deleting the event
    }
}
