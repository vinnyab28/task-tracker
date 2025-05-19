import { auth } from "@/firebase"; // adjust this import based on your setup
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
	name: string;
	email: string;
	uid: string;
};

const AuthContext = createContext<{
	user: User | null;
	logout: () => void;
}>({
	user: null,
	logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	// const [loadingUser, setLoadingUser] = useState<boolean>(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
			if (firebaseUser) {
				setUser({
					name: firebaseUser.displayName || firebaseUser.email || "Anonymous",
					email: firebaseUser.email || "",
					uid: firebaseUser.uid,
				});
			} else {
				setUser(null);
			}
		});
		return () => unsubscribe();
	}, []);

	const logout = () => signOut(auth);

	return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
