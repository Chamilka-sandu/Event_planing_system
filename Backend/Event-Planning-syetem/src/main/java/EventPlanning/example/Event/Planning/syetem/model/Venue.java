package EventPlanning.example.Event.Planning.syetem.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Venue {

    private String address;
    private double latitude;
    private double longitude;

    // Constructors
    public Venue() {}

    public Venue(String address, double latitude, double longitude) {
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters and Setters
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
}
