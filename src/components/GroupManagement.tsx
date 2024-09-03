import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import {
  Button,
  Switch,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Typography,
  FormControlLabel,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Modal,
  IconButton,
  fabClasses
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import { fetchUsers } from '../services/Apiusers';
import { createGroup, deleteGroup, getAllGroups, editGroup } from '../services/Apigroup';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

interface User {
  userId: string;
  userName: string;
}

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [errors, setErrors] = useState({
    groupName: '',
    groupCode: '',
    groupType: '',
  });

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsData = await getAllGroups();
        if (Array.isArray(groupsData)) {
          setGroups(groupsData);
        } else {
          console.error('Fetched data is not an array:', groupsData);
          setGroups([]); // Handle unexpected data type
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]); // Handle error by setting an empty array
      }
    };
    fetchGroups();
  }, []);

  const [newGroup, setNewGroup] = useState({
    groupName: '',
    groupCode: '',
    status: true,
    groupType: '',
    groupMembers: [] as User[]
  });

  
  const handleAddGroup = async () => {
    debugger
    if (!validateForm()) return;

    try {
      if (isEditing && currentGroupIndex !== null) {
        const groupToUpdate = groups[currentGroupIndex];
        await editGroup(groupToUpdate.id, newGroup);
        const updatedGroups = [...groups];
        updatedGroups[currentGroupIndex] = newGroup;
        setGroups(updatedGroups);
        setSuccessMessage('Group updated successfully');
      } else {
        const response = await createGroup(newGroup);
        setGroups([...groups, response]);
        setSuccessMessage('Group created successfully');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.response?.data);
    } finally {
      setIsDialogOpen(true); 
    }
  };

  const handleCloseDialoga = () => {
    setIsDialogOpen(false);
    setError(null);
    setSuccessMessage(null);
    setShowForm(false);

  };

  const handleEditGroup = (index: number) => {
    const groupToEdit = groups[index];
    setNewGroup(groupToEdit);
    setCurrentGroupIndex(index);
    setIsEditing(true);
    setShowForm(true);
  };

 

  const handleOpenDialog = (id: number) => {
    setGroupToDelete(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setGroupToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (groupToDelete !== null) {
        try {
            await deleteGroup(groupToDelete); // API call to delete the group
            const updatedGroups = groups.filter(group => group.id !== groupToDelete);
            setGroups(updatedGroups);
        } catch (error: any) {
            // Capture the error and show it in the modal
            setError(error.response?.data || 'An unexpected error occurred');
            setOpenErrorModal(true); // Open the error modal
        }
    }
    handleCloseDialog(); // Close the confirmation dialog
};

const handleCloseErrorModal = () => {
  setOpenErrorModal(false); // Close the error modal
};

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleChangeMembers = (event: any) => {
    const {
      target: { value },
    } = event;
    const selectedUsers = typeof value === 'string'
      ? value.split(',').map(userName => users.find(user => user.userName === userName)!)
      : value.map((userName: string) => users.find(user => user.userName === userName)!);
    
    setNewGroup({
      ...newGroup,
      groupMembers: selectedUsers,
    });
  };

  const resetForm = () => {
    setNewGroup({
      groupName: '',
      groupCode: '',
      status: true,
      groupType: '',
      groupMembers: []
    });
    setErrors({
      groupName: '',
      groupCode: '',
      groupType: '',
    });
    setShowForm(false);
    setIsEditing(false);
    setCurrentGroupIndex(null);
  };
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      groupName: '',
      groupCode: '',
      groupType: '',
    };

    if (!newGroup.groupName) {
      newErrors.groupName = 'Group Name is required';
      valid = false;
    }

    if (!newGroup.groupCode) {
      newErrors.groupCode = 'Group Code is required';
      valid = false;
    }

    if (!newGroup.groupType) {
      newErrors.groupType = 'Group Type is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
  return (
    <div>
      {!showForm && (
     <div >
        <Button variant="outlined" onClick={handleShowForm} >Add New Group</Button>
      </div>
      )}
      {showForm && (
        <Box
          sx={{
            border: '1px solid gray',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '600px',
            margin: 'auto',
            marginTop: '20px',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {isEditing ? 'Edit Group' : 'Create New Group'}
          </Typography>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Group Name"
              value={newGroup.groupName}
              onChange={(e) => setNewGroup({ ...newGroup, groupName: e.target.value })}
              fullWidth
              margin="normal"
              error={!!errors.groupName}
              helperText={errors.groupName}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Group Code"
              value={newGroup.groupCode}
              onChange={(e) => setNewGroup({ ...newGroup, groupCode: e.target.value })}
              fullWidth
              margin="normal"
              error={!!errors.groupCode}
              helperText={errors.groupCode}
            />
          </FormControl>
          <FormControl margin="normal" fullWidth style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
            <Typography style={{ marginRight: '16px', color: 'gray' }}>Status</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={newGroup.status}
                  onChange={(e) => setNewGroup({ ...newGroup, status: e.target.checked })}
                  color="primary"
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
              label={newGroup.status ? 'Active' : 'Inactive'}
              labelPlacement="end"
            />
          </FormControl>
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="group-type-label">Group Type</InputLabel>
            <Select
              labelId="group-type-label"
              value={newGroup.groupType}
              onChange={(e) => setNewGroup({ ...newGroup, groupType: e.target.value })}
              label="Group Type"
              error={!!errors.groupType}
            >
              <MenuItem value="Corporate">Corporate</MenuItem>
              <MenuItem value="Private">Private</MenuItem>
              <MenuItem value="Public">Public</MenuItem>
            </Select>
            {errors.groupType && (
              <FormHelperText error>{errors.groupType}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Group Members</InputLabel>
            <Select
              multiple
              value={newGroup.groupMembers.map(member => member.userName)}
              onChange={handleChangeMembers}
              input={<OutlinedInput label="Group Members" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {users.map((user) => (
                <MenuItem key={user.userId} value={user.userName}>
                  <Checkbox checked={newGroup.groupMembers.some(member => member.userName === user.userName)} />
                  <ListItemText primary={user.userName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={resetForm} color="secondary" style={{ marginRight: '8px' }}>Cancel</Button>
            <Button onClick={handleAddGroup} color="primary" variant="contained">
              {isEditing ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </Box>
      )}
      {!showForm && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 , marginTop:2}} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Group Name</StyledTableCell>
                <StyledTableCell align="right">Group Code</StyledTableCell>
                <StyledTableCell align="right">Status</StyledTableCell>
                <StyledTableCell align="right">Group Type</StyledTableCell>
                <StyledTableCell align="right">Members</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((group, index) => (
                <StyledTableRow key={group.id}>
                  <StyledTableCell component="th" scope="row">
                    {group.groupName}
                  </StyledTableCell>
                  <StyledTableCell align="right">{group.groupCode}</StyledTableCell>
                  <StyledTableCell align="right">{group.status ? 'Active' : 'Inactive'}</StyledTableCell>
                  <StyledTableCell align="right">{group.groupType}</StyledTableCell>
                  <StyledTableCell align="right">
                    {group.groupMembers.map((member: User) => member.userName).join(', ')}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                  <IconButton onClick={() => handleEditGroup(index)} color="primary" aria-label="edit">
        <EditIcon />
      </IconButton>
      <IconButton onClick={() => handleOpenDialog(group.id)} color="secondary" aria-label="delete">
        <DeleteIcon />
      </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Group"}</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this group?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
                open={openErrorModal}
                onClose={handleCloseErrorModal}
            >
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        {error}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseErrorModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDialogOpen} onClose={handleCloseDialoga}>
        <DialogTitle>{error ? 'Error' : 'Success'}</DialogTitle>
        <DialogContent>
          <Typography>{error || successMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialoga}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GroupManagement;
