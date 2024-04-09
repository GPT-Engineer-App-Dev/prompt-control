import { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Input, Heading, Text, VStack, HStack, IconButton, useToast } from "@chakra-ui/react";
import { FaEdit, FaTrash, FaSignOutAlt } from "react-icons/fa";

const API_URL = "http://localhost:1337/api";

const Index = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [promptName, setPromptName] = useState("");
  const [promptText, setPromptText] = useState("");
  const [editingPromptId, setEditingPromptId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchPrompts(token);
    }
  }, []);

  const login = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: username, password }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchPrompts(data.jwt);
      } else {
        toast({
          title: "Login failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const register = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchPrompts(data.jwt);
      } else {
        toast({
          title: "Registration failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setPrompts([]);
  };

  const fetchPrompts = async (token) => {
    try {
      const response = await fetch(`${API_URL}/prompts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPrompts(data.data);
    } catch (error) {
      console.error("Error fetching prompts:", error);
    }
  };

  const createPrompt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            name: promptName,
            prompt: promptText,
          },
        }),
      });
      const data = await response.json();
      setPrompts([...prompts, data.data]);
      setPromptName("");
      setPromptText("");
      toast({
        title: "Prompt created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating prompt:", error);
    }
  };

  const updatePrompt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/prompts/${editingPromptId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            name: promptName,
            prompt: promptText,
          },
        }),
      });
      const data = await response.json();
      setPrompts(prompts.map((prompt) => (prompt.id === editingPromptId ? data.data : prompt)));
      setEditingPromptId(null);
      setPromptName("");
      setPromptText("");
      toast({
        title: "Prompt updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating prompt:", error);
    }
  };

  const deletePrompt = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/prompts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPrompts(prompts.filter((prompt) => prompt.id !== id));
      toast({
        title: "Prompt deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  const startEditing = (prompt) => {
    setEditingPromptId(prompt.id);
    setPromptName(prompt.attributes.name);
    setPromptText(prompt.attributes.prompt);
  };

  if (!isLoggedIn) {
    return (
      <Box p={4}>
        <Heading as="h1" mb={4}>
          Login
        </Heading>
        <FormControl id="username" mb={4}>
          <FormLabel>Username</FormLabel>
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <FormControl id="password" mb={4}>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button onClick={login} mb={4}>
          Login
        </Button>
        <Text>
          Don't have an account?{" "}
          <Button variant="link" onClick={() => setIsLoggedIn(false)}>
            Register
          </Button>
        </Text>
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <Box p={4}>
        <Heading as="h1" mb={4}>
          Register
        </Heading>
        <FormControl id="email" mb={4}>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="username" mb={4}>
          <FormLabel>Username</FormLabel>
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <FormControl id="password" mb={4}>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button onClick={register} mb={4}>
          Register
        </Button>
        <Text>
          Already have an account?{" "}
          <Button variant="link" onClick={() => setIsLoggedIn(true)}>
            Login
          </Button>
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={4}>
        <Heading as="h1">Prompts</Heading>
        <Button leftIcon={<FaSignOutAlt />} onClick={logout}>
          Logout
        </Button>
      </HStack>
      <VStack align="stretch" spacing={4}>
        {prompts.map((prompt) => (
          <Box key={prompt.id} borderWidth={1} borderRadius="md" p={4}>
            <Heading as="h2" size="md" mb={2}>
              {prompt.attributes.name}
            </Heading>
            <Text mb={4}>{prompt.attributes.prompt}</Text>
            <HStack>
              <IconButton icon={<FaEdit />} onClick={() => startEditing(prompt)} />
              <IconButton icon={<FaTrash />} onClick={() => deletePrompt(prompt.id)} />
            </HStack>
          </Box>
        ))}
      </VStack>
      <Heading as="h2" size="lg" mt={8} mb={4}>
        {editingPromptId ? "Edit Prompt" : "Create Prompt"}
      </Heading>
      <FormControl id="promptName" mb={4}>
        <FormLabel>Name</FormLabel>
        <Input type="text" value={promptName} onChange={(e) => setPromptName(e.target.value)} />
      </FormControl>
      <FormControl id="promptText" mb={4}>
        <FormLabel>Prompt</FormLabel>
        <Input type="text" value={promptText} onChange={(e) => setPromptText(e.target.value)} />
      </FormControl>
      <Button onClick={editingPromptId ? updatePrompt : createPrompt} colorScheme="blue">
        {editingPromptId ? "Update Prompt" : "Create Prompt"}
      </Button>
    </Box>
  );
};

export default Index;
