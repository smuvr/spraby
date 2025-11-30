import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Tooltip,
} from '@heroui/react';

interface Brand {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    is_active: boolean;
    user_name: string;
    created_at: string;
}

interface Props {
    brands: Brand[];
}

export default function Index({ brands }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this brand?')) {
            router.delete(route('admin.brands.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Brands Management
                    </h2>
                    <Button
                        as={Link}
                        href={route('admin.brands.create')}
                        color="primary"
                    >
                        Create Brand
                    </Button>
                </div>
            }
        >
            <Head title="Brands" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Table aria-label="Brands table">
                                <TableHeader>
                                    <TableColumn>NAME</TableColumn>
                                    <TableColumn>SLUG</TableColumn>
                                    <TableColumn>OWNER</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                    <TableColumn>CREATED</TableColumn>
                                    <TableColumn>ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {brands.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center"
                                            >
                                                No brands found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        brands.map((brand) => (
                                            <TableRow key={brand.id}>
                                                <TableCell>
                                                    {brand.name}
                                                </TableCell>
                                                <TableCell>
                                                    {brand.slug}
                                                </TableCell>
                                                <TableCell>
                                                    {brand.user_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={
                                                            brand.is_active
                                                                ? 'success'
                                                                : 'danger'
                                                        }
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {brand.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    {brand.created_at}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Tooltip content="Edit">
                                                            <Button
                                                                as={Link}
                                                                href={route(
                                                                    'admin.brands.edit',
                                                                    brand.id,
                                                                )}
                                                                size="sm"
                                                                color="primary"
                                                                variant="light"
                                                            >
                                                                Edit
                                                            </Button>
                                                        </Tooltip>
                                                        <Tooltip content="Delete">
                                                            <Button
                                                                size="sm"
                                                                color="danger"
                                                                variant="light"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        brand.id,
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
