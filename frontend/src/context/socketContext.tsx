import { createContext, useState, useEffect, useContext, ReactNode, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { AuthContext } from "./authContext";

interface ISocketContext {
	socket: Socket | null;
	onlineUsers: string[];
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);

export const useSocketContext = (): ISocketContext => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocketContext must be used within a SocketContextProvider");
	}
	return context;
};

const socketURL = "https://campuscarawanbackenddeployed-production.up.railway.app";

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
	const socketRef = useRef<Socket | null>(null);
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	const auth = useContext(AuthContext);

	if (!auth) {
		return null; 
	}

	useEffect(() => {
		if (auth.accessToken && !auth.loading) {
			const socket = io(socketURL, {
				query: { userId: auth.user?.id },
			});
			socketRef.current = socket;

			socket.on("getOnlineUsers", (users: string[]) => {
				setOnlineUsers(() => users); 
			});

			return () => {
				socket.disconnect();
				socketRef.current = null;
			};
		} else if (!auth.user && !auth.loading) {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		}
	}, [auth.user, auth.loading, auth.accessToken]); 

	return (
		<SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};

export default SocketContextProvider;
