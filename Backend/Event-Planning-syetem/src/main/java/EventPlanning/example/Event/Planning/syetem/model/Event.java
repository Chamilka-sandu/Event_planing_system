package EventPlanning.example.Event.Planning.syetem.model;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventTitle;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Embedded
    private Venue venue;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private Boolean isPublic;

    @Column(nullable = false)
    private String inviteType;


@ManyToMany
@JoinTable(
            name = "event_groups",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "group_code")
    )
    private List<Group> invitedGroups ;

    @ManyToMany
    @JoinTable(
            name = "event_users",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> invitedUsers;

    @Column(nullable = false)
    private String status;

    // Constructors
    public Event() {}

    public Event(String eventTitle, String description, LocalDateTime dateTime, Venue venue,
                 String eventType, Boolean isPublic, String inviteType, List<Group> invitedGroups,
                 List<User> invitedUsers, String status) {
        this.eventTitle = eventTitle;
        this.description = description;
        this.dateTime = dateTime;
        this.venue = venue;
        this.eventType = eventType;
        this.isPublic = isPublic;
        this.inviteType = inviteType;
        this.invitedGroups = invitedGroups;
        this.invitedUsers = invitedUsers;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public Venue getVenue() {
        return venue;
    }

    public void setVenue(Venue venue) {
        this.venue = venue;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public String getInviteType() {
        return inviteType;
    }

    public void setInviteType(String inviteType) {
        this.inviteType = inviteType;
    }

    public List<Group> getInvitedGroups() {
        return invitedGroups;
    }

    public void setInvitedGroups(List<Group> invitedGroups) {
        this.invitedGroups = invitedGroups;
    }

    public List<User> getInvitedUsers() {
        return invitedUsers;
    }

    public void setInvitedUsers(List<User> invitedUsers) {
        this.invitedUsers = invitedUsers;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


}
