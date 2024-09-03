package EventPlanning.example.Event.Planning.syetem.service;

import EventPlanning.example.Event.Planning.syetem.Exception.GroupException;
import EventPlanning.example.Event.Planning.syetem.model.Event;
import EventPlanning.example.Event.Planning.syetem.model.Group;
import EventPlanning.example.Event.Planning.syetem.repository.EventRepository;
import EventPlanning.example.Event.Planning.syetem.repository.GroupRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private EventRepository eventRepository; // Assuming this repository handles the event_groups table
    private static final Logger logger = LoggerFactory.getLogger(GroupService.class);

    public Group saveGroup(Group group) {
        // Check if a group with the same groupCode already exists
        if (groupRepository.existsByGroupCode(group.getGroupCode())) {
            throw new IllegalStateException("Group code already exists");
        }
        return groupRepository.save(group);
    }



    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public Optional<Group> getGroupById(Long id) {
        return groupRepository.findById(id);
    }


    public List<Group> getGroupsByCodes(List<String> groupCode) {
        return groupRepository.findByGroupCodeIn(groupCode);
    }



    public boolean isGroupCodeExists(String groupCode) {
        return groupRepository.existsByGroupCode(groupCode);
    }
    public Group updateGroup(Long id, Group groupDetails) {
        try {
            Optional<Group> existingGroupOpt = groupRepository.findById(id);

            if (!existingGroupOpt.isPresent()) {
                throw new IllegalStateException("Group not found with id " + id);
            }

            Group existingGroup = existingGroupOpt.get();

            // Check if the new group code is different and validate uniqueness
            if (!existingGroup.getGroupCode().equals(groupDetails.getGroupCode())) {
                if (groupRepository.existsByGroupCode(groupDetails.getGroupCode())) {
                    throw new IllegalArgumentException("Group code already exists");
                }
            }

            // Update other fields
            existingGroup.setGroupName(groupDetails.getGroupName());
            existingGroup.setGroupMembers(groupDetails.getGroupMembers());
            // Update other fields as necessary

            return groupRepository.save(existingGroup);
        } catch (Exception e) {
            // Log the exception
            logger.error("Error updating group", e);
            throw new RuntimeException("Internal server error while updating group");
        }
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        // Check if the group is associated with any events
        boolean isGroupAssociatedWithEvents = eventRepository.existsByInvitedGroupsContaining(group);

        if (isGroupAssociatedWithEvents) {
            throw new IllegalStateException("Cannot delete group as it is associated with events.");
        }

        groupRepository.delete(group);
    }



    @Transactional
    public Group editGroup(Long id, Group updatedGroupDetails) {
        // Fetch the existing group by its ID
        Group existingGroup = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with id " + id));

        // If the groupCode is being changed, ensure the new groupCode is unique
        if (!existingGroup.getGroupCode().equals(updatedGroupDetails.getGroupCode())) {
            if (groupRepository.existsByGroupCode(updatedGroupDetails.getGroupCode())) {
                throw new IllegalStateException("Group code already exists");
            }
            existingGroup.setGroupCode(updatedGroupDetails.getGroupCode());
        }

        // Update other fields
        existingGroup.setGroupName(updatedGroupDetails.getGroupName());
        existingGroup.setStatus(updatedGroupDetails.getStatus());
        existingGroup.setGroupType(updatedGroupDetails.getGroupType());

        // Update group members if needed
        existingGroup.setGroupMembers(updatedGroupDetails.getGroupMembers());

        // Save the updated group
        return groupRepository.save(existingGroup);
    }

}
