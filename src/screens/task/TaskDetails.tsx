import React, { useState, useEffect, useMemo } from 'react';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Alert,
    TextInput,
    Modal,
    Linking,
    StatusBar,
    ImageBackground
} from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import type { ImagePickerResponse, MediaType, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker'

// Import your assets
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import profilephoto from "../../assets/images/profilephoto.png";
import taskicon from "../../assets/images/taskicon.gif";
import howtodoit from "../../assets/images/howtodoiticon.gif";
import VerificationModal from '../../components/VerficationModal';
import { Colors } from '../../constants/Colors';
import { useUser } from "../../context/UserContext";

// Navigation types
type NavigationProp = any;
type RouteProp = any;

// Type definitions
interface AssignedUser {
    id: string;
    username: string;
    email: string;
    task_status: string | null;
}

interface ApiTask {
    task_id?: string;
    id: string;
    task_name: string;
    task_description: string;
    task_reward: string;
    task_status: string;
    task_starttime: string;
    task_endtime: string;
    created_at: string;
    status: string;
    assigned_users: AssignedUser[];
    // Add fields for downloadable content
    task_video?: string;
    task_image?: string;
    downloadable_file?: string;
}

interface ApiResponse {
    status: string;
    message: string;
    data: ApiTask[];
}

interface SubmissionResponse {
    status: string;
    message: string;
    data: {
        submission_id: number;
        task_id: number;
        user_id: number;
        task_image: string;
        task_url: string;
        task_status: string;
    };
}

const TaskDetails = () => {
    // Get navigation and route
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp>();

    // Get taskId from route params
    const taskId = route.params?.taskId;

    // State management
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [taskDetail, setTaskDetail] = useState<ApiTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [taskUrl, setTaskUrl] = useState('');
    const [taskImage, setTaskImage] = useState('');
    const [selectedImageName, setSelectedImageName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Get user ID from context
    const { getUserId } = useUser();
    const USER_ID = getUserId();

    // Get user-specific task status from assigned_users array
    const getUserTaskStatus = useMemo(() => {
        if (!taskDetail || !taskDetail.assigned_users || !USER_ID) return null;

        const currentUser = taskDetail.assigned_users.find(user =>
            String(user.id) === String(USER_ID)
        );

        return currentUser?.task_status || null;
    }, [taskDetail, USER_ID]);

    // Fetch task details by ID using get_tasks API
    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!USER_ID) {
                setError('User not logged in. Please login again.');
                return;
            }

            if (!taskId) {
                setError('Task ID not provided.');
                return;
            }

            const requestBody = {
                action: "get_tasks"
            };

            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.status === 'success' && data.data) {
                // Find the specific task by ID
                const foundTask = data.data.find(task =>
                    String(task.id) === String(taskId) ||
                    String(task.task_id) === String(taskId)
                );

                if (foundTask) {
                    // Check if current user is assigned to this task
                    const isUserAssigned = foundTask.assigned_users.some(user =>
                        String(user.id) === String(USER_ID)
                    );

                    if (isUserAssigned) {
                        setTaskDetail(foundTask);
                    } else {
                        setError('You are not assigned to this task');
                    }
                } else {
                    setError('Task not found');
                }
            } else {
                setError(data.message || 'Failed to fetch task details');
            }
        } catch (err) {
            console.error('Error fetching task details:', err);
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Download function for task materials
    const downloadTaskFile = async () => {
        try {
            setIsDownloading(true);

            if (!taskDetail) {
                Alert.alert('Error', 'Task details not available');
                return;
            }

            // Check if there's a downloadable file
            const downloadUrl = taskDetail.task_video || taskDetail.task_image || taskDetail.downloadable_file;

            if (!downloadUrl) {
                Alert.alert('No Download Available', 'This task does not have any downloadable materials.');
                return;
            }

            // For now, we'll open the URL in browser/external app
            const supported = await Linking.canOpenURL(downloadUrl);

            if (supported) {
                await Linking.openURL(downloadUrl);
                Alert.alert('Download Started', 'The file download has been initiated in your browser.');
            } else {
                Alert.alert('Error', 'Unable to open the download link.');
            }

        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Download Failed', 'Failed to download the file. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Check if downloadable content is available
    const hasDownloadableContent = useMemo(() => {
        if (!taskDetail) return false;
        return !!(taskDetail.task_video || taskDetail.task_image || taskDetail.downloadable_file);
    }, [taskDetail]);

    // Get download file type for display
    const getDownloadFileType = () => {
        if (!taskDetail) return 'File';

        if (taskDetail.task_video) return 'Video';
        if (taskDetail.task_image) return 'Image';
        if (taskDetail.downloadable_file) {
            const url = taskDetail.downloadable_file.toLowerCase();
            if (url.includes('.pdf')) return 'PDF';
            if (url.includes('.doc') || url.includes('.docx')) return 'Document';
            if (url.includes('.zip') || url.includes('.rar')) return 'Archive';
            return 'File';
        }
        return 'File';
    };

    const submitTask = async () => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);

            if (!USER_ID || !taskId) {
                setSubmitError('Missing user or task information');
                return;
            }

            if (!taskUrl && !taskImage) {
                setSubmitError('Please provide either a URL or upload an image');
                return;
            }

            // Create FormData for proper file upload
            const formData = new FormData();
            formData.append('action', 'add_submission');
            formData.append('task_id', String(taskId));
            formData.append('user_id', String(USER_ID));
            formData.append('task_url', taskUrl || '');

            // Add image file if selected
            if (taskImage) {
                const getFileExtension = (filename: string): string => {
                    if (!filename) return 'jpg';
                    const parts = filename.split('.');
                    return parts.length > 1 ? parts.pop()?.toLowerCase() || 'jpg' : 'jpg';
                };

                const timestamp = Math.floor(Date.now() / 1000);
                const extension = getFileExtension(selectedImageName);
                const originalName = selectedImageName ? selectedImageName.replace(/\.[^/.]+$/, "") : "image";
                const fileName = `${timestamp}_${originalName}.${extension}`;

                const getMimeType = (ext: string): string => {
                    switch (ext.toLowerCase()) {
                        case 'png': return 'image/png';
                        case 'jpg':
                        case 'jpeg': return 'image/jpeg';
                        case 'gif': return 'image/gif';
                        case 'webp': return 'image/webp';
                        default: return 'image/jpeg';
                    }
                };

                formData.append('task_image', {
                    uri: taskImage,
                    type: getMimeType(extension),
                    name: fileName
                } as any);

                console.log('Uploading file:', fileName);
            }

            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: {
                    // Don't set Content-Type manually for FormData
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            console.log('Server response:', responseText);

            let data: SubmissionResponse;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Response text:', responseText);
                throw new Error('Invalid JSON response from server');
            }

            if (data.status === 'success') {
                console.log('Upload successful:', data.data);

                // Refresh task details to get updated status
                await fetchTaskDetails();

                // Clear form data
                setTaskUrl('');
                setTaskImage('');
                setSelectedImageName('');

                // Open verification modal
                setIsModalVisible(true);
            } else {
                setSubmitError(data.message || 'Failed to submit task');
                console.error('Server error:', data);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error submitting task:', err);
            setSubmitError(`Upload failed: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Updated image picker to handle file info properly
    const pickImage = () => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo' as MediaType,
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
            includeExtra: true,
        };

        launchImageLibrary(options, (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
                if (response.errorMessage) {
                    Alert.alert('Error', response.errorMessage);
                }
                return;
            }

            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];

                if (asset.uri) {
                    setTaskImage(asset.uri);
                    setSelectedImageName(asset.fileName || `image_${Date.now()}.jpg`);
                    Alert.alert('Success', 'Image selected successfully!');
                } else {
                    Alert.alert('Error', 'Failed to select image. Please try again.');
                }
            }
        });
    };

    // Updated camera function
    const openCamera = () => {
        const options: CameraOptions = {
            mediaType: 'photo' as MediaType,
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
            includeExtra: true,
        };

        launchCamera(options, (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
                if (response.errorMessage) {
                    Alert.alert('Error', response.errorMessage);
                }
                return;
            }

            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];

                if (asset.uri) {
                    setTaskImage(asset.uri);
                    setSelectedImageName(asset.fileName || `photo_${Date.now()}.jpg`);
                    Alert.alert('Success', 'Photo captured successfully!');
                } else {
                    Alert.alert('Error', 'Failed to capture photo. Please try again.');
                }
            }
        });
    };

    // Show camera/gallery options
    const showImagePickerOptions = () => {
        Alert.alert(
            'Select Image',
            'Choose an option',
            [
                {
                    text: 'Camera',
                    onPress: () => openCamera()
                },
                {
                    text: 'Gallery',
                    onPress: () => pickImage()
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Load task details on component mount
    useEffect(() => {
        fetchTaskDetails();
    }, [taskId, USER_ID]);

    // Handler to mark task as complete
    const handleMarkComplete = () => {
        if (!taskUrl && !taskImage) {
            setSubmitError('Please provide either a URL or upload an image before marking as complete');
            return;
        }

        setSubmitError(null);
        submitTask();
    };

    // Handler to close verification modal
    const handleCloseModal = () => {
        setIsModalVisible(false);
        navigation.goBack();
    };

    // Handler for modal action
    const handleBackToTask = () => {
        setIsModalVisible(false);
        navigation.goBack();
    };

    // Navigation handlers
    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleProfilePress = () => {
        navigation.navigate('UserProfile', { from: 'task/taskdetails' });
    };

    const handleInstructionsPress = () => {
        navigation.navigate('Instructions', { taskId: taskId });
    };

    // Check if task can be submitted based on user's task status
    const canSubmitTask = useMemo(() => {
        const userStatus = getUserTaskStatus?.toLowerCase();
        // Users can submit only if: no status or any status except approved, pending, and rejected
        return !userStatus || (userStatus !== 'approved' && userStatus !== 'pending' && userStatus !== 'rejected');
    }, [getUserTaskStatus]);

    // Get display status for UI
    const getDisplayStatus = () => {
        const userStatus = getUserTaskStatus;
        if (!userStatus) return 'Not Started';

        switch (userStatus.toLowerCase()) {
            case 'approved': return 'Completed';
            case 'pending': return 'Pending Review';
            case 'rejected': return 'Rejected';
            default: return userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
        }
    };

    // Loading state
    if (loading) {
        return (
            <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <View className="flex-1 items-center justify-center">
                    <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl">
                        Loading task details...
                    </Text>
                </View>
            </View>
        );
    }

    // Error state
    if (error || !taskDetail) {
        return (
            <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <View className="flex-1 items-center justify-center px-4">
                    <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-xl text-center mb-4">
                        {error || 'Task not found'}
                    </Text>
                    <TouchableOpacity
                        onPress={handleBackPress}
                        className="px-6 py-3 rounded-lg"
                        style={{ backgroundColor: Colors.light.bgBlueBtn }}
                    >
                        <Text style={{ color: Colors.light.whiteFefefe }} className="text-base font-semibold">
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* =================== HEADER WITH BACKGROUND IMAGE =================== */}
            <ImageBackground
                source={bg2}
                resizeMode="cover"
                className="h-32"
                style={{ position: 'relative' }}
            >
                <View className="flex-1 pt-12 pb-4 px-4">
                    <View className="flex-row items-center justify-between h-16">
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={handleBackPress}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <Image source={icons.back} className="w-4 h-6" />
                        </TouchableOpacity>

                        {/* Centered title */}
                        <View className="flex-1 items-center">
                            <Text
                                style={{ color: Colors.light.whiteFfffff }}
                                className="text-3xl font-medium pt-1"
                            >
                                Task Details
                            </Text>
                        </View>

                        {/* Profile photo */}
                        <TouchableOpacity
                            onPress={handleProfilePress}
                            style={{ backgroundColor: Colors.light.whiteFfffff }}
                            className="w-10 h-10 rounded-full items-center justify-center"
                        >
                            <Image
                                source={profilephoto}
                                className="h-10 w-10 rounded-full"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Header border line */}
                <View
                    className="absolute bottom-0 w-full h-[1px]"
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                />
            </ImageBackground>

            {/* =================== SCROLLABLE CONTENT SECTION =================== */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
            >
                {/* =================== TASK TITLE SECTION =================== */}
                <View className="py-5 flex-row items-center">
                    <Image source={taskicon} className="w-[40px] h-[40px]" />
                    <Text style={{ color: Colors.light.whiteFefefe }} className="font-semibold text-2xl pl-4">
                        {taskDetail.task_name}
                    </Text>
                </View>

                {/* =================== TASK DESCRIPTION SECTION =================== */}
                <View className="mb-4">
                    <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-base leading-6">
                        {taskDetail.task_description}
                    </Text>
                </View>

                {/* =================== HASHTAGS SECTION =================== */}
                <View className="py-4">
                    <Text style={{ color: Colors.light.whiteFefefe }} className="text-lg font-semibold mb-3">
                        Hashtags to Use
                    </Text>
                    <View className="flex-row flex-wrap">
                        {['#MiragioCoin', '#TaskCompleted', '#EarnCoins', '#CryptoRewards', '#DigitalTasks', '#OnlineEarning'].map((hashtag, index) => (
                            <View
                                key={index}
                                style={{ backgroundColor: Colors.light.backlight2, borderColor: Colors.light.bgBlueBtn }}
                                className="border rounded-full px-3 py-1 mr-2 mb-2"
                            >
                                <Text style={{ color: Colors.light.bgBlueBtn }} className="text-sm font-medium">
                                    {hashtag}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-sm mt-2">
                        Copy and use these hashtags when posting about this task
                    </Text>
                </View>

                {/* =================== TASK DETAILS CARDS SECTION =================== */}
                <View className="py-5">
                    {/* =================== DUE DATE CARD =================== */}
                    <View style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }} className="w-full rounded-lg border-l-2 mb-3">
                        <View className="flex-row p-3">
                            <View className="mr-2 items-center justify-center">
                                <Image
                                    source={icons.duedateicon}
                                    className="h-[32px] w-[32px]"
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text style={{ color: Colors.light.whiteFefefe }} className="text-base mb-1 font-bold">
                                    Due Date
                                </Text>
                                <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-sm">
                                    {formatDate(taskDetail.task_endtime)}
                                </Text>
                            </View>

                            <View className="items-center justify-center">
                                <Image source={icons.duecheckicon} className="h-[36px] w-[36px]" />
                            </View>
                        </View>
                    </View>

                    {/* =================== TASK STATUS CARD =================== */}
                    <View style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }} className="w-full rounded-lg border-l-2 mb-3">
                        <View className="flex-row p-3">
                            <View className="mr-2 items-center justify-center">
                                <Image
                                    source={icons.assignicon}
                                    className="h-[32px] w-[32px]"
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text style={{ color: Colors.light.whiteFefefe }} className="text-base mb-1 font-bold">
                                    Task Status
                                </Text>
                                <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-sm">
                                    {getDisplayStatus()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* =================== REWARD CARD =================== */}
                    <View style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }} className="w-full rounded-lg border-l-2 mb-3">
                        <View className="flex-row p-3">
                            <View className="mr-2 items-center justify-center">
                                <Image
                                    source={icons.maincoin}
                                    className="h-[32px] w-[32px]"
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text style={{ color: Colors.light.whiteFefefe }} className="text-base mb-1 font-bold">
                                    Reward
                                </Text>
                                <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-sm">
                                    {taskDetail.task_reward} coins
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* =================== DOWNLOAD MATERIALS CARD =================== */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderLeftColor: Colors.light.bgGreen,
                            opacity: isDownloading ? 0.7 : 1
                        }}
                        className="w-full rounded-lg border-l-2 mb-3"
                        onPress={downloadTaskFile}
                        disabled={isDownloading}
                    >
                        <View className="flex-row p-3">
                            <View className="mr-2 items-center justify-center">
                                <Image
                                    source={icons.download || icons.go}
                                    className="h-[32px] w-[32px]"
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text style={{ color: Colors.light.whiteFefefe }} className="text-base mb-1 font-bold">
                                    {isDownloading ? 'Downloading...' : 'Download Materials'}
                                </Text>
                                <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-sm">
                                    {isDownloading ? 'Please wait...' : 'Download task materials and examples'}
                                </Text>
                            </View>

                            <View className="items-center justify-center">
                                <Image
                                    source={icons.go}
                                    className="w-3 h-3"
                                    style={{ opacity: isDownloading ? 0.5 : 1 }}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* =================== UPLOAD SECTION =================== */}
                    {canSubmitTask && (
                        <View className="mb-4">
                            {/* Image Preview Section */}
                            {taskImage && (
                                <View style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }} className="w-full rounded-lg border-l-2 mb-3 p-3">
                                    <Text style={{ color: Colors.light.whiteFefefe }} className="text-base mb-2 font-bold">
                                        Selected Image
                                    </Text>

                                    <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-sm mb-2">
                                        {selectedImageName}
                                    </Text>

                                    <View className="w-full h-48 rounded-lg overflow-hidden mb-2" style={{ backgroundColor: '#333' }}>
                                        <Image
                                            source={{ uri: taskImage }}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            resizeMode="cover"
                                        />
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setTaskImage('');
                                            setSelectedImageName('');
                                        }}
                                        className="px-4 py-2 rounded-lg self-end"
                                        style={{ backgroundColor: Colors.light.placeholderColorOp70 }}
                                    >
                                        <Text style={{ color: Colors.light.whiteFefefe }} className="text-sm">
                                            Remove Image
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* URL Preview Section */}
                            {taskUrl && (
                                <View style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }} className="w-full rounded-lg border-l-2 mb-3 p-3">
                                    <Text style={{ color: Colors.light.whiteFefefe }} className="text-base mb-2 font-bold">
                                        Added URL
                                    </Text>
                                    <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-sm mb-2">
                                        {taskUrl}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setTaskUrl('')}
                                        className="px-4 py-2 rounded-lg self-end"
                                        style={{ backgroundColor: Colors.light.placeholderColorOp70 }}
                                    >
                                        <Text style={{ color: Colors.light.whiteFefefe }} className="text-sm">
                                            Remove URL
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Upload Controls */}
                            <View className="flex-row justify-between">
                                {/* Upload photo card */}
                                <TouchableOpacity
                                    style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }}
                                    className="w-[48%] rounded-lg border-l-2"
                                    onPress={showImagePickerOptions}
                                    disabled={isSubmitting}
                                >
                                    <View className="flex-row p-3">
                                        <View className="mr-2 items-center justify-center">
                                            <Image
                                                source={icons.uploadphoto}
                                                className="h-[30px] w-[30px]"
                                                resizeMode="contain"
                                            />
                                        </View>

                                        <View className="flex-1">
                                            <Text style={{ color: Colors.light.whiteFefefe }} className="text-sm mb-1 font-bold">
                                                Upload Photo
                                            </Text>
                                            <Text style={{ color: taskImage ? Colors.light.bgGreen : Colors.light.placeholderColorOp70 }} className="text-xs">
                                                {taskImage ? 'Photo selected' : 'add screenshot'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* Add URL card */}
                                <TouchableOpacity
                                    style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }}
                                    className="w-[48%] rounded-lg border-l-2"
                                    onPress={() => setShowUrlModal(true)}
                                    disabled={isSubmitting}
                                >
                                    <View className="flex-row p-3">
                                        <View className="mr-2 items-center justify-center">
                                            <Image
                                                source={icons.addurl}
                                                className="h-[30px] w-[30px]"
                                                resizeMode="contain"
                                            />
                                        </View>

                                        <View className="flex-1">
                                            <Text style={{ color: Colors.light.whiteFefefe }} className="text-sm mb-1 font-bold">
                                                Add Url
                                            </Text>
                                            <Text style={{ color: taskUrl ? Colors.light.bgGreen : Colors.light.placeholderColorOp70 }} className="text-xs">
                                                {taskUrl ? 'URL added' : 'Add url link'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* =================== HOW TO DO IT CARD =================== */}
                    <TouchableOpacity
                        style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }}
                        className="w-full rounded-lg border-l-2 mb-3"
                        onPress={handleInstructionsPress}
                    >
                        <View className="flex-row p-3">
                            <View className="mr-2 items-center justify-center">
                                <Image
                                    source={howtodoit}
                                    className="h-[32px] w-[32px]"
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text style={{ color: Colors.light.whiteFefefe }} className="text-base mb-1 font-bold">
                                    How to do it
                                </Text>
                                <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-sm">
                                    Read the instructions to complete tasks
                                </Text>
                            </View>

                            <View className="items-center justify-center">
                                <Image source={icons.go} className="w-3 h-3" />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* =================== MARK AS COMPLETE BUTTON =================== */}
                    {canSubmitTask && (
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.light.bgGreen,
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                            className="w-full h-14 items-center justify-center rounded-lg mb-3"
                            onPress={handleMarkComplete}
                            disabled={isSubmitting}
                        >
                            <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-semibold">
                                {isSubmitting ? 'Submitting...' : 'Mark As Complete'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* =================== STATUS BUTTONS =================== */}
                    {getUserTaskStatus?.toLowerCase() === 'pending' && (
                        <View
                            style={{ backgroundColor: "#FFA500" }}
                            className="w-full h-14 items-center justify-center rounded-lg mb-3 opacity-80"
                        >
                            <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-semibold">
                                ⏳ Pending Review
                            </Text>
                        </View>
                    )}

                    {getUserTaskStatus?.toLowerCase() === 'approved' && (
                        <View
                            style={{ backgroundColor: Colors.light.bgGreen }}
                            className="w-full h-14 items-center justify-center rounded-lg mb-3 opacity-80"
                        >
                            <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-semibold">
                                Task Completed
                            </Text>
                        </View>
                    )}

                    {getUserTaskStatus?.toLowerCase() === 'rejected' && (
                        <View
                            style={{ backgroundColor: '#ff4444' }}
                            className="w-full h-14 items-center justify-center rounded-lg mb-3 opacity-80"
                        >
                            <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-semibold">
                                Task Rejected
                            </Text>
                        </View>
                    )}

                    {/* =================== ERROR MESSAGE =================== */}
                    {submitError && (
                        <View className="w-full mb-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', borderColor: '#ff4444', borderWidth: 1 }}>
                            <Text style={{ color: '#ff4444' }} className="text-center text-sm">
                                {submitError}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* =================== URL INPUT MODAL =================== */}
            <Modal
                visible={showUrlModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowUrlModal(false)}
            >
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <View
                        style={{ backgroundColor: Colors.light.backlight2 }}
                        className="w-4/5 p-6 rounded-lg"
                    >
                        <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-bold mb-4">
                            Add Task URL
                        </Text>

                        <TextInput
                            style={{
                                backgroundColor: Colors.light.blackPrimary,
                                color: Colors.light.whiteFefefe,
                                borderColor: Colors.light.bgBlueBtn
                            }}
                            className="border-2 rounded-lg p-3 mb-4"
                            placeholder="Enter URL here..."
                            placeholderTextColor={Colors.light.placeholderColorOp70}
                            value={taskUrl}
                            onChangeText={setTaskUrl}
                            multiline={false}
                            autoCapitalize="none"
                            keyboardType="url"
                        />

                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                onPress={() => setShowUrlModal(false)}
                                className="px-4 py-2 mr-3"
                            >
                                <Text style={{ color: Colors.light.placeholderColorOp70 }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ backgroundColor: Colors.light.bgBlueBtn }}
                                className="px-6 py-2 rounded-lg"
                                onPress={() => setShowUrlModal(false)}
                            >
                                <Text style={{ color: Colors.light.whiteFefefe }} className="font-semibold">
                                    Save
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* =================== VERIFICATION MODAL =================== */}
            <VerificationModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                onBackToTask={handleBackToTask}
            />
        </View>
    );
};

export default TaskDetails;
