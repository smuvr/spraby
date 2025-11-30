import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input, Textarea, Switch, Button, Card, CardBody } from '@heroui/react';
import { FormEventHandler } from 'react';

interface Brand {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    is_active: boolean;
}

interface Props {
    brand: Brand;
}

export default function Edit({ brand }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: brand.name || '',
        slug: brand.slug || '',
        description: brand.description || '',
        logo: brand.logo || '',
        is_active: brand.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.brands.update', brand.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Brand: {brand.name}
                </h2>
            }
        >
            <Head title={`Edit Brand: ${brand.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardBody>
                            <form onSubmit={submit} className="space-y-6">
                                <Input
                                    label="Brand Name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    isRequired
                                    labelPlacement={'inside'}
                                    isInvalid={!!errors.name}
                                    errorMessage={errors.name}
                                />

                                <Input
                                    label="Slug"
                                    placeholder="brand-slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    isInvalid={!!errors.slug}
                                    errorMessage={errors.slug}
                                    description="URL-friendly identifier (auto-generated from name if left empty)"
                                />

                                <Textarea
                                    label="Description"
                                    placeholder="Enter brand description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    isInvalid={!!errors.description}
                                    errorMessage={errors.description}
                                    minRows={4}
                                />

                                <Input
                                    label="Logo URL"
                                    placeholder="Enter logo URL"
                                    value={data.logo}
                                    onChange={(e) =>
                                        setData('logo', e.target.value)
                                    }
                                    isInvalid={!!errors.logo}
                                    errorMessage={errors.logo}
                                />

                                <Switch
                                    isSelected={data.is_active}
                                    onValueChange={(value) =>
                                        setData('is_active', value)
                                    }
                                >
                                    Active
                                </Switch>

                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isLoading={processing}
                                    >
                                        Update Brand
                                    </Button>
                                    <Button
                                        as={Link}
                                        href={route('admin.brands.index')}
                                        variant="light"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
