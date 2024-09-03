package EventPlanning.example.Event.Planning.syetem.service;

import EventPlanning.example.Event.Planning.syetem.model.User;
import EventPlanning.example.Event.Planning.syetem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {


    @Autowired
    private UserRepository userRepository;




    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // New method to retrieve users by a list of IDs
//    public List<User> getGroupByIds(List<Long> userIds) {
//        return userRepository.findAllById(userIds);
//    }
    public Optional<User> getUserByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    public List<User> getUsersByIds(List<String> userId) {
        return userRepository.findByUserIdIn(userId); // Assuming you have this method in your repository
    }


}


