import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, CircularProgress, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material';
import { ArrowBack, MenuBook } from '@mui/icons-material';

const AdminIssuedBooks = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        const fetchIssuedBooks = async () => {
            try {
                const response = await axios.get('http://localhost:7000/admin/issuedbooks', {
                    withCredentials: true,
                });
                if (active) setBooks(response.data.books || []);
            } catch (fetchError) {
                console.error('Error fetching admin issued books:', fetchError);
                if (active) {
                    setError(fetchError.response?.data?.msg || 'Failed to load issued books.');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchIssuedBooks();
        return () => { active = false; };
    }, []);

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Back to dashboard
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MenuBook color="primary" />
                <Typography variant="h4" fontWeight={700}>Currently Issued Books</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                    <CircularProgress />
                </Box>
            ) : !error && books.length === 0 ? (
                <Alert severity="info">There are no books currently issued.</Alert>
            ) : !error && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Book</TableCell>
                                <TableCell>Author</TableCell>
                                <TableCell>Issued To</TableCell>
                                <TableCell>Issue Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {books.map(record => (
                                <TableRow key={record._id}>
                                    <TableCell>{record.book?.bookName || 'Book no longer in catalog'}</TableCell>
                                    <TableCell>{record.book?.author || '—'}</TableCell>
                                    <TableCell>{record.studentName || '—'}</TableCell>
                                    <TableCell>
                                        {record.date
                                            ? new Date(record.date).toLocaleDateString()
                                            : '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default AdminIssuedBooks;
