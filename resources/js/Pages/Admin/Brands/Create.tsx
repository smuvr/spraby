import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input, Textarea, Switch, Button, Card, CardBody } from '@heroui/react';
import { FormEventHandler } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        logo: '',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.brands.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Brand
                </h2>
            }
        >
            <Head title="Create Brand" />

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
                                    labelPlacement={'outside'}
                                    isInvalid={!!errors.name}
                                    errorMessage={errors.name}
                                />

                                <Input
                                    label="Slug"
                                    placeholder="brand-slug (leave empty to auto-generate)"
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
                                        Create Brand
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
